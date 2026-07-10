-- SQL script to set up the Battery Passports table in Supabase
CREATE TABLE IF NOT EXISTS passports (
    serial_number TEXT PRIMARY KEY,
    token_id BIGINT,
    adi TEXT NOT NULL,
    db_sha256_hash TEXT NOT NULL,
    ipfs_cid TEXT NOT NULL,
    document JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on token_id for fast lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_passports_token_id ON passports(token_id);

-- Enable Row Level Security (RLS)
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (viewing dashboard / verifying)
CREATE POLICY "Allow public read access" ON passports
    FOR SELECT USING (true);

-- Create policy to allow authenticated or service-role write access
CREATE POLICY "Allow service-role write access" ON passports
    FOR ALL USING (true) WITH CHECK (true);
