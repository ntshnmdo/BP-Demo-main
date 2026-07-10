import os
import random
import sys
import sqlite3
import json

from anchor_passport import anchor_passport, load_env
from verify_passport import verify_by_serial

def main():
    load_env()
    
    contract_address = os.getenv("CONTRACT_ADDRESS")
    private_key = os.getenv("ANCHOR_PRIVATE_KEY")
    
    if not private_key:
        print("="*60)
        print("ERROR: ANCHOR_PRIVATE_KEY is not set in .env!")
        print("Please edit the .env file at backend/.. (or project root) and add your key.")
        print("Ensure the wallet contains testnet ADI tokens for gas.")
        print("="*60)
        sys.exit(1)
        
    if not contract_address:
        print("="*60)
        print("ERROR: CONTRACT_ADDRESS is not set in .env!")
        print("Please deploy the smart contract first by running:")
        print("  python3 backend/deploy.py")
        print("="*60)
        sys.exit(1)
        
    # Generate a random serial number to prevent collision
    serial_number = f"SN-TEST-{random.randint(100000, 999999)}"
    print(f"Starting End-to-End Test for Battery Serial: {serial_number}")
    print(f"Contract Address: {contract_address}\n")
    
    mock_passport = {
        "adi": f"acc://acme-ev.adi/battery/{serial_number}",
        "battery_serial_number": serial_number,
        "battery_model": "ACME-LION-X1",
        "manufacturer_name": "ACME Batteries Corp",
        "manufacturer_id": "GB123456789",
        "manufacturing_date": "2026-07-07",
        "manufacturing_place": "Detroit, USA",
        "battery_category": "EV",
        "battery_status": "original",
        "battery_weight_kg": 450.5,
        "chemistry": "NMC-811",
        "nominal_voltage_v": 400.0,
        "nominal_capacity_ah": 150.0,
        "energy_capacity_kwh": 60.0,
        "rated_capacity_ah": 150.0,
        "power_capability_w": 180000.0,
        "internal_resistance_mohm": 1.2,
        "expected_lifetime_cycles": 2000,
        "state_of_health_percent": 100.0,
        "state_of_charge_percent": 80.0,
        "depth_of_discharge_percent": 0.0,
        "temperature_range_min_c": -20.0,
        "temperature_range_max_c": 55.0,
        "round_trip_efficiency_percent": 96.5,
        "capacity_fade_percent": 0.0,
        "hazardous_substances": "No banned substances, standard electrolyte.",
        "critical_raw_materials": "Cobalt, Lithium, Nickel, Manganese.",
        "cobalt_percent": 12.0,
        "lithium_percent": 4.5,
        "nickel_percent": 60.0,
        "lead_percent": 0.0,
        "recycled_cobalt_percent": 10.0,
        "recycled_lithium_percent": 5.0,
        "recycled_nickel_percent": 15.0,
        "recycled_lead_percent": 0.0,
        "carbon_footprint_kgco2e": 2400.0,
        "carbon_footprint_class": "A",
        "renewable_content_percent": 25.0,
        "collection_recycling_info": "Return to authorized EV recycler only.",
        "ce_marking": True,
        "eu_declaration_of_conformity_url": f"https://acme-ev.adi/compliance/doc-{serial_number}",
        "warranty_period_months": 96,
        "ce_certificate_number": "CE-12345-NMC"
    }
    
    # ----------------------------------------------------
    # Step 1: Anchor the mock battery passport on-chain
    # ----------------------------------------------------
    print("--- STEP 1: Anchoring Passport On-Chain ---")
    # Owner address: use deployment wallet as the owner of the RWA token for testing
    from web3 import Web3
    w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
    deployer_account = w3.eth.account.from_key(private_key)
    owner_address = deployer_account.address
    
    result = anchor_passport(mock_passport, owner_address)
    print(f"Minted Token ID: {result.token_id}")
    print(f"Transaction Hash: {result.tx_hash}")
    print(f"Database Hash: {result.db_sha256_hash}")
    print(f"IPFS/Local CID: {result.ipfs_cid}\n")
    
    # ----------------------------------------------------
    # Step 2: Verify database record (should be Valid)
    # ----------------------------------------------------
    print("--- STEP 2: Verifying Stored Record (Should pass) ---")
    report = verify_by_serial(serial_number)
    print(f"Verdict: {report.verdict} (is_valid={report.is_valid})")
    assert report.is_valid, "E2E Error: Newly anchored passport failed verification!"
    print("Verification passed successfully!\n")
    
    # ----------------------------------------------------
    # Step 3: Tamper with database record
    # ----------------------------------------------------
    print("--- STEP 3: Tampering with DB Record (Changing nominal_capacity_ah) ---")
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT document FROM passports WHERE serial_number = ?", (serial_number,))
    row = cursor.fetchone()
    
    doc = json.loads(row[0])
    doc["nominal_capacity_ah"] = 250.0  # Tampered field
    
    cursor.execute("UPDATE passports SET document = ? WHERE serial_number = ?", (json.dumps(doc), serial_number))
    conn.commit()
    conn.close()
    print("Database record successfully tampered locally.\n")
    
    # ----------------------------------------------------
    # Step 4: Verify record again (should be Tampered)
    # ----------------------------------------------------
    print("--- STEP 4: Verifying Stored Record (Should fail) ---")
    report = verify_by_serial(serial_number)
    print(f"Verdict: {report.verdict} (is_valid={report.is_valid})")
    assert not report.is_valid, "E2E Error: Tampered record was verified as Valid!"
    print("Tamper-detection verified successfully!\n")
    
    print("="*60)
    print("SUCCESS: End-to-End Verification Pipeline Works Perfectly!")
    print("="*60)

if __name__ == "__main__":
    main()
