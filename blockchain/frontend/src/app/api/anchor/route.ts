import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { supabaseAdmin } from '@/lib/supabase';
import { validatePassport, sha256Hex } from '@/lib/passport';

const ANCHOR_ABI = [
  "function anchorPassport(address to, string adi, string dbHash, string cid) external returns (uint256)",
  "event PassportAnchored(uint256 indexed tokenId, address indexed to, string adi, string dbSha256Hash, string ipfsCid, uint256 timestamp)"
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { document, ownerAddress } = body;

    // 1. Validate inputs
    if (!ownerAddress || !ethers.isAddress(ownerAddress)) {
      return NextResponse.json({ error: 'Invalid or missing ownerAddress EVM address.' }, { status: 400 });
    }

    const validationErrors = validatePassport(document);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: 'Schema validation failed.', details: validationErrors }, { status: 400 });
    }

    // 2. Generate canonical SHA-256 fingerprint
    const hash = sha256Hex(document);

    // 3. Determine Storage CID (using local mode reference for prototype)
    const storageMode = (process.env.STORAGE_MODE || 'local').toLowerCase();
    let cid = `local://${hash}`;

    if (storageMode === 'ipfs') {
      // In production, we'd pin to Pinata/IPFS here. 
      // For this implementation, we default to the local URI format.
      cid = `ipfs://${hash}`;
    }

    // 4. Read blockchain configuration
    const rpcUrl = process.env.RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.ANCHOR_PRIVATE_KEY;

    if (!rpcUrl || !contractAddress || !privateKey) {
      return NextResponse.json({ error: 'Server misconfigured. Missing blockchain environment variables.' }, { status: 500 });
    }

    // 5. Connect and sign transaction
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ANCHOR_ABI, wallet);

    console.log(`Submitting anchor transaction from ${wallet.address}...`);
    
    // Call anchorPassport on-chain
    const tx = await contract.anchorPassport(
      ownerAddress,
      document.adi,
      hash,
      cid
    );
    
    console.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
    const receipt = await tx.wait();

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json({ error: 'Blockchain transaction failed.' }, { status: 500 });
    }

    // Parse the emitted logs to find the minted tokenId
    let tokenId: number | null = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log as any);
        if (parsedLog && parsedLog.name === 'PassportAnchored') {
          tokenId = Number(parsedLog.args[0]); // tokenId is the first argument
          break;
        }
      } catch (e) {
        // Log did not match our ABI fragment, continue
      }
    }

    if (tokenId === null) {
      console.warn('Transaction completed but tokenId was not parsed from logs.');
    }

    // 6. Save passport to Supabase database
    const { error: dbError } = await supabaseAdmin
      .from('passports')
      .insert({
        serial_number: document.battery_serial_number,
        token_id: tokenId,
        adi: document.adi,
        db_sha256_hash: hash,
        ipfs_cid: cid,
        document: document
      });

    if (dbError) {
      console.error('Supabase Database Error:', dbError);
      return NextResponse.json({ 
        error: 'Data successfully anchored on-chain, but failed to persist in the database.', 
        txHash: tx.hash,
        tokenId 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tokenId,
      txHash: tx.hash,
      hash,
      cid,
      contractAddress: contractAddress
    });

  } catch (err: any) {
    console.error('Anchoring Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
