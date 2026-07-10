"""
verify_passport.py
==================

Tamper-detection flow. Given a battery serial number, it:

    1. Fetches the current JSON record from the traditional database.
    2. Canonicalizes + SHA-256 hashes it ON THE FLY (same algorithm as anchoring).
    3. Resolves the serial number -> tokenId (via an ADI->tokenId index).
    4. Calls the on-chain `verifyHash(tokenId, freshHash)` VIEW function.
    5. Returns a definitive boolean: True == "Valid", False == "Tampered".

Because verifyHash is a `view` function, this costs no gas — it's a pure read.

How this connects to the Solidity contract
-------------------------------------------
The contract stored `dbSha256Hash` at anchoring time. Here we recompute the hash
from whatever the DB currently holds and ask the chain "does this still match?".
If a single byte of the DB record changed since anchoring, the recomputed hash
diverges and verifyHash returns False -> Tampered.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

from passport_model import sha256_hex

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


# Only the read functions are needed for verification.
VERIFY_ABI = [
    {
        "type": "function",
        "name": "verifyHash",
        "stateMutability": "view",
        "inputs": [
            {"name": "tokenId", "type": "uint256"},
            {"name": "frontendGeneratedHash", "type": "string"},
        ],
        "outputs": [{"name": "", "type": "bool"}],
    },
    {
        "type": "function",
        "name": "getPassportDetails",
        "stateMutability": "view",
        "inputs": [{"name": "tokenId", "type": "uint256"}],
        "outputs": [
            {"name": "adi", "type": "string"},
            {"name": "dbSha256Hash", "type": "string"},
            {"name": "ipfsCid", "type": "string"},
            {"name": "timestamp", "type": "uint256"},
        ],
    },
]


@dataclass
class VerificationReport:
    """Human- and machine-readable outcome of a verification check."""

    serial_number: str
    token_id: int
    computed_hash: str
    anchored_hash: str
    ipfs_cid: str
    is_valid: bool  # True -> "Valid", False -> "Tampered"

    @property
    def verdict(self) -> str:
        return "Valid" if self.is_valid else "Tampered"


# --------------------------------------------------------------------------- #
#                     Traditional-database simulation                         #
# --------------------------------------------------------------------------- #
def fetch_record_from_database(serial_number: str) -> dict:
    """Fetches the raw document dictionary from local SQLite database."""
    from database import fetch_record_from_database as db_fetch
    return db_fetch(serial_number)


def resolve_token_id(serial_number: str) -> int:
    """Resolves the on-chain token ID mapped to the given serial number from local SQLite."""
    from database import resolve_token_id as db_resolve
    return db_resolve(serial_number)



# --------------------------------------------------------------------------- #
#                             Verification core                               #
# --------------------------------------------------------------------------- #
def verify_by_serial(serial_number: str) -> VerificationReport:
    """
    Definitive Valid/Tampered check for one battery, driven only by its serial.
    """
    load_env()
    rpc_url = os.environ["RPC_URL"]
    contract_address = Web3.to_checksum_address(os.environ["CONTRACT_ADDRESS"])

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    contract = w3.eth.contract(address=contract_address, abi=VERIFY_ABI)

    # 1. Current DB record + 2. recompute the fingerprint on the fly.
    record = fetch_record_from_database(serial_number)
    computed_hash = sha256_hex(record)

    # 3. serial -> tokenId
    token_id = resolve_token_id(serial_number)

    # 4. Ask the chain whether the fresh hash still matches the anchored one.
    #    This is a gas-free `view` call.
    is_valid = contract.functions.verifyHash(token_id, computed_hash).call()

    # Also pull the stored details for reporting / audit trails.
    _adi, anchored_hash, ipfs_cid, _ts = contract.functions.getPassportDetails(
        token_id
    ).call()

    return VerificationReport(
        serial_number=serial_number,
        token_id=token_id,
        computed_hash=computed_hash,
        anchored_hash=anchored_hash,
        ipfs_cid=ipfs_cid,
        is_valid=bool(is_valid),
    )


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("usage: python verify_passport.py <BATTERY_SERIAL_NUMBER>")
        raise SystemExit(2)

    report = verify_by_serial(sys.argv[1])
    print(f"Serial       : {report.serial_number}")
    print(f"Token id     : {report.token_id}")
    print(f"Computed hash: {report.computed_hash}")
    print(f"Anchored hash: {report.anchored_hash}")
    print(f"IPFS CID     : {report.ipfs_cid}")
    print(f"VERDICT      : {report.verdict}")
    # Non-zero exit on tamper so CI / monitoring can alert.
    raise SystemExit(0 if report.is_valid else 1)
