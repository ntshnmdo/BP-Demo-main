import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "passports.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    """Initializes the SQLite database and creates the passports table if it doesn't exist."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS passports (
                serial_number TEXT PRIMARY KEY,
                token_id INTEGER,
                adi TEXT,
                db_sha256_hash TEXT,
                ipfs_cid TEXT,
                document TEXT
            )
        """)
        conn.commit()

def save_passport_record(serial_number: str, token_id: int, adi: str, db_sha256_hash: str, ipfs_cid: str, document: dict):
    """Inserts or replaces a passport record in the local database."""
    init_db()
    with get_connection() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO passports (serial_number, token_id, adi, db_sha256_hash, ipfs_cid, document)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (serial_number, token_id, adi, db_sha256_hash, ipfs_cid, json.dumps(document))
        )
        conn.commit()

def fetch_record_from_database(serial_number: str) -> dict:
    """Fetches the raw document dictionary from the database for the given serial number."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT document FROM passports WHERE serial_number = ?", (serial_number,))
        row = cursor.fetchone()
        if not row:
            raise KeyError(f"No passport record found for serial number: {serial_number}")
        return json.loads(row[0])

def resolve_token_id(serial_number: str) -> int:
    """Resolves the on-chain token ID mapped to the given serial number."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT token_id FROM passports WHERE serial_number = ?", (serial_number,))
        row = cursor.fetchone()
        if not row:
            raise KeyError(f"No token ID found for serial number: {serial_number}")
        return row[0]
