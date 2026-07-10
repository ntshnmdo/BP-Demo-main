import os
import json
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

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

def update_env_contract_address(address: str):
    """Updates the CONTRACT_ADDRESS in config files."""
    paths = [".env", "../.env", "backend/.env", "frontend/.env.local", "../frontend/.env.local"]
    for path in paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            with open(path, "w", encoding="utf-8") as f:
                for line in lines:
                    if line.strip().startswith("CONTRACT_ADDRESS="):
                        f.write(f"CONTRACT_ADDRESS={address}\n")
                    else:
                        f.write(line)
            print(f"Updated {path} with CONTRACT_ADDRESS={address}")

def main():
    load_env()
    
    rpc_url = os.getenv("RPC_URL")
    private_key = os.getenv("ANCHOR_PRIVATE_KEY")
    
    if not rpc_url:
        raise ValueError("RPC_URL environment variable is not set in .env")
    if not private_key:
        raise ValueError("ANCHOR_PRIVATE_KEY environment variable is not set in .env")
        
    print(f"Connecting to RPC: {rpc_url}")
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to the network RPC endpoint.")
        
    # Get deployment account
    account = w3.eth.account.from_key(private_key)
    print(f"Deployer Address: {account.address}")
    
    # Check balance
    balance_wei = w3.eth.get_balance(account.address)
    balance_adi = w3.from_wei(balance_wei, "ether")
    print(f"Deployer Balance: {balance_adi} ADI")
    
    if balance_wei == 0:
        print("Warning: Balance is 0 ADI! Deployment will fail due to lack of gas.")
    
    # Load contract artifact
    artifact_path = os.path.join(os.path.dirname(__file__), "../artifacts/contracts/BatteryPassportAnchor.sol/BatteryPassportAnchor.json")
    if not os.path.exists(artifact_path):
        raise FileNotFoundError(f"Artifact not found at {artifact_path}. Did you run 'npx hardhat compile'?")
        
    with open(artifact_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)
        
    abi = artifact["abi"]
    bytecode = artifact["bytecode"]
    
    # Create contract factory
    contract_factory = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    print("Building deployment transaction...")
    # Build transaction for deploying the contract
    # Passing the deployer's address as the constructor 'admin' parameter.
    construct_txn = contract_factory.constructor(account.address).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address, "pending"),
        'chainId': w3.eth.chain_id,
    })
    
    print("Signing deployment transaction...")
    signed_txn = w3.eth.account.sign_transaction(construct_txn, private_key=private_key)
    
    print("Sending deployment transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    print(f"Transaction hash: {tx_hash.hex()}")
    
    print("Waiting for transaction confirmation (this might take a few seconds on L2)...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
    
    if receipt.status != 1:
        raise RuntimeError(f"Contract deployment transaction reverted! Tx: {tx_hash.hex()}")
        
    contract_address = receipt.contractAddress
    print(f"\nBatteryPassportAnchor successfully deployed at: {contract_address}")
    
    # Update local .env file
    update_env_contract_address(contract_address)

if __name__ == "__main__":
    main()
