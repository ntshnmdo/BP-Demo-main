"""
anchor_passport.py
==================

End-to-end backend flow: receive a Battery Passport JSON -> validate -> canonicalize
-> SHA-256 -> pin to Pinata IPFS -> anchor (mint) on the BatteryPassportAnchor
smart contract.

How this connects to the Solidity contract
-------------------------------------------
The final step calls `anchorPassport(address to, string adi, string dbHash, string cid)`
on-chain. The `dbHash` we send is `BatteryPassport.sha256_hex()`, and `cid` is the
Pinata CID of the SAME canonical bytes we hashed. Because the contract stores those
strings verbatim, `verify_passport.py` can later recompute the hash and compare.

Configuration is read from environment variables so no secrets are hard-coded:

    RPC_URL              JSON-RPC endpoint of the EVM chain.
    CONTRACT_ADDRESS     Deployed BatteryPassportAnchor address.
    ANCHOR_PRIVATE_KEY   Private key of a wallet holding ANCHOR_ROLE.
    PINATA_JWT           Pinata API JWT (Bearer token) for pinning.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass

import requests
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

from passport_model import BatteryPassport

def load_env():
    """Loads environment variables from a .env file if it exists."""
    for path in [".env", "../.env", "backend/.env"]:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        os.environ[key.strip()] = val.strip().strip('"').strip("'")
            break


# --------------------------------------------------------------------------- #
#                          Minimal ABI (only what we call)                    #
# --------------------------------------------------------------------------- #
# We include only the functions/events this script touches. A full ABI works too,
# but the anchor + verify functions are all the backend needs at runtime.
ANCHOR_ABI = [
    {
        "type": "function",
        "name": "anchorPassport",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "to", "type": "address"},
            {"name": "adi", "type": "string"},
            {"name": "dbHash", "type": "string"},
            {"name": "cid", "type": "string"},
        ],
        "outputs": [{"name": "tokenId", "type": "uint256"}],
    },
    {
        "type": "event",
        "name": "PassportAnchored",
        "anonymous": False,
        "inputs": [
            {"name": "tokenId", "type": "uint256", "indexed": True},
            {"name": "to", "type": "address", "indexed": True},
            {"name": "adi", "type": "string", "indexed": False},
            {"name": "dbSha256Hash", "type": "string", "indexed": False},
            {"name": "ipfsCid", "type": "string", "indexed": False},
            {"name": "timestamp", "type": "uint256", "indexed": False},
        ],
    },
]

PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"


@dataclass
class AnchorResult:
    """Return payload persisted back into the traditional DB after anchoring."""

    token_id: int
    tx_hash: str
    db_sha256_hash: str
    ipfs_cid: str


# --------------------------------------------------------------------------- #
#                              IPFS (Pinata) layer                            #
# --------------------------------------------------------------------------- #
def pin_canonical_json_to_pinata(passport: BatteryPassport, jwt: str) -> str:
    """
    Pin the passport's CANONICAL bytes to Pinata and return the resulting CID.

    Critical detail: we pin the exact same canonical bytes we hash. We send the
    parsed canonical object as `pinataContent`, and because Pinata re-serializes,
    we DON'T rely on Pinata's serialization for the hash — the hash always comes
    from `passport.sha256_hex()` locally. The CID is only the retrieval pointer.
    """
    canonical = passport.canonical_bytes()

    headers = {
        "Authorization": f"Bearer {jwt}",
        "Content-Type": "application/json",
    }
    payload = {
        # json.loads(canonical) -> the object; Pinata stores it under this key.
        "pinataContent": json.loads(canonical),
        "pinataMetadata": {
            "name": f"battery-passport-{passport.battery_serial_number}",
            "keyvalues": {"adi": passport.adi},
        },
        # cidVersion 1 -> modern base32 CIDs (bafy...).
        "pinataOptions": {"cidVersion": 1},
    }

    resp = requests.post(PINATA_PIN_JSON_URL, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()["IpfsHash"]


# --------------------------------------------------------------------------- #
#                              Blockchain layer                               #
# --------------------------------------------------------------------------- #
def anchor_on_chain(
    w3: Web3,
    contract,
    signer_key: str,
    *,
    to: str,
    adi: str,
    db_hash: str,
    cid: str,
) -> tuple[int, str]:
    """
    Build, sign, and send the anchorPassport transaction; wait for the receipt;
    parse the emitted PassportAnchored event to recover the minted tokenId.

    Returns (token_id, tx_hash_hex).
    """
    account = w3.eth.account.from_key(signer_key)

    # Build the raw transaction. We fetch the pending nonce so back-to-back anchors
    # from the same wallet don't collide. EIP-1559 fee fields are filled by the node
    # defaults via `build_transaction`.
    tx = contract.functions.anchorPassport(
        Web3.to_checksum_address(to),
        adi,
        db_hash,
        cid,
    ).build_transaction(
        {
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address, "pending"),
            "chainId": w3.eth.chain_id,
        }
    )

    # Sign locally — the private key never leaves this process.
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

    if receipt.status != 1:
        raise RuntimeError(f"anchorPassport reverted (tx {tx_hash.hex()})")

    # Decode the PassportAnchored event to read the tokenId assigned by the contract.
    events = contract.events.PassportAnchored().process_receipt(receipt)
    token_id = int(events[0]["args"]["tokenId"])
    return token_id, tx_hash.hex()


# --------------------------------------------------------------------------- #
#                             Orchestration entry                             #
# --------------------------------------------------------------------------- #
def anchor_passport(raw_json: dict, owner_address: str) -> AnchorResult:
    """
    The full pipeline invoked by the API layer when a new passport is submitted.

        raw_json      -> the 42-field document received from the frontend / DB.
        owner_address -> who should own the resulting RWA token.

    Steps:
        1. Validate + freeze via the strict Pydantic model (enforces 42 fields).
        2. Canonicalize + SHA-256 (the fingerprint anchored on-chain).
        3. Pin the identical canonical bytes to Pinata IPFS (or save locally for prototype).
        4. Send anchorPassport(to, adi, dbHash, cid) and capture the tokenId.
        5. Save the details to local SQLite database for verification.
    """
    load_env()
    # 1. Strict validation. Raises pydantic.ValidationError on any missing/extra field.
    passport = BatteryPassport.model_validate(raw_json)

    # 2. Deterministic fingerprint.
    db_hash = passport.sha256_hex()

    # --- wire up chain + config from env ---
    rpc_url = os.environ["RPC_URL"]
    contract_address = Web3.to_checksum_address(os.environ["CONTRACT_ADDRESS"])
    signer_key = os.environ["ANCHOR_PRIVATE_KEY"]
    storage_mode = os.getenv("STORAGE_MODE", "local").lower()

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    # Many testnets (Polygon Amoy, BSC, etc.) are POA chains and need this middleware
    # to parse the extended `extraData` field in block headers.
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    contract = w3.eth.contract(address=contract_address, abi=ANCHOR_ABI)

    # 3. IPFS backup or local storage — returns the CID pointing at the canonical bytes.
    if storage_mode == "ipfs":
        pinata_jwt = os.environ["PINATA_JWT"]
        cid = pin_canonical_json_to_pinata(passport, pinata_jwt)
    else:
        # Local prototype storage
        cid = f"local://{db_hash}"

    # 4. Anchor on-chain. dbHash + cid now permanently bound to the ADI + tokenId.
    token_id, tx_hash = anchor_on_chain(
        w3,
        contract,
        signer_key,
        to=owner_address,
        adi=passport.adi,
        db_hash=db_hash,
        cid=cid,
    )

    # 5. Save record to local database for verification checks.
    from database import save_passport_record
    save_passport_record(
        serial_number=passport.battery_serial_number,
        token_id=token_id,
        adi=passport.adi,
        db_sha256_hash=db_hash,
        ipfs_cid=cid,
        document=raw_json
    )

    return AnchorResult(
        token_id=token_id,
        tx_hash=tx_hash,
        db_sha256_hash=db_hash,
        ipfs_cid=cid,
    )
