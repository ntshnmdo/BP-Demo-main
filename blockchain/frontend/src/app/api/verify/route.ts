import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { supabaseAdmin } from '@/lib/supabase';
import { sha256Hex, canonicalize } from '@/lib/passport';

const VERIFY_ABI = [
  "function verifyHash(uint256 tokenId, string frontendGeneratedHash) external view returns (bool)",
  "function getPassportDetails(uint256 tokenId) external view returns (string adi, string dbSha256Hash, string ipfsCid, uint256 timestamp)"
];

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serial = searchParams.get('serial');

    if (!serial) {
      return NextResponse.json({ error: 'Missing required query parameter: serial' }, { status: 400 });
    }

    // 1. Fetch current DB record
    const { data: dbRecord, error: dbError } = await supabaseAdmin
      .from('passports')
      .select('*')
      .eq('serial_number', serial)
      .maybeSingle();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    if (!dbRecord) {
      return NextResponse.json({ error: `Battery serial number '${serial}' not found in database.` }, { status: 404 });
    }

    // 2. Recompute SHA-256 fingerprint on the fly
    const computedHash = sha256Hex(dbRecord.document);

    // 3. Connect to blockchain network
    const rpcUrl = process.env.RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !contractAddress) {
      return NextResponse.json({ error: 'Server misconfigured. Missing blockchain environment variables.' }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, VERIFY_ABI, provider);

    const tokenId = dbRecord.token_id;
    if (tokenId === null || tokenId === undefined) {
      return NextResponse.json({ error: 'Database record exists but has not been anchored on-chain.' }, { status: 400 });
    }

    // 4. Query the contract verifyHash view function (gas-free)
    console.log(`Verifying hash on-chain for tokenId ${tokenId}...`);
    const isValid = await contract.verifyHash(tokenId, computedHash);

    // 5. Query anchored details for reports
    const [anchoredAdi, anchoredHash, ipfsCid, timestamp] = await contract.getPassportDetails(tokenId);

    return NextResponse.json({
      serial_number: serial,
      token_id: tokenId,
      computed_hash: computedHash,
      anchored_hash: anchoredHash,
      ipfs_cid: ipfsCid,
      adi: anchoredAdi,
      timestamp: Number(timestamp),
      is_valid: isValid,
      verdict: isValid ? 'Valid' : 'Tampered',
      contract_address: contractAddress,
      canonical_json: canonicalize(dbRecord.document)
    });

  } catch (err: any) {
    console.error('Verification Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
