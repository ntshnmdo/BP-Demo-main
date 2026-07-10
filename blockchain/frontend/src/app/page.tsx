'use client';

import { useState, useEffect } from 'react';

const INITIAL_FORM_STATE = {
  // --- 1. Identity & provenance (fields 1-9) ---
  adi: '',
  battery_serial_number: '',
  battery_model: '',
  manufacturer_name: '',
  manufacturer_id: '',
  manufacturing_date: '',
  manufacturing_place: '',
  battery_category: 'EV',
  battery_status: 'original',

  // --- 2. Physical & electrochemical (fields 10-24) ---
  battery_weight_kg: 0,
  chemistry: '',
  nominal_voltage_v: 0,
  nominal_capacity_ah: 0,
  energy_capacity_kwh: 0,
  rated_capacity_ah: 0,
  power_capability_w: 0,
  internal_resistance_mohm: 0,
  expected_lifetime_cycles: 0,
  state_of_health_percent: 100,
  state_of_charge_percent: 80,
  depth_of_discharge_percent: 0,
  temperature_range_min_c: -20,
  temperature_range_max_c: 55,
  round_trip_efficiency_percent: 95,
  capacity_fade_percent: 0,

  // --- 3. Materials & sustainability (fields 25-38) ---
  hazardous_substances: 'None',
  critical_raw_materials: 'Cobalt, Lithium, Nickel',
  cobalt_percent: 0,
  lithium_percent: 0,
  nickel_percent: 0,
  lead_percent: 0,
  recycled_cobalt_percent: 0,
  recycled_lithium_percent: 0,
  recycled_nickel_percent: 0,
  recycled_lead_percent: 0,
  carbon_footprint_kgco2e: 0,
  carbon_footprint_class: 'A',
  renewable_content_percent: 0,
  collection_recycling_info: 'Recycle through authorized centers.',

  // --- 4. Compliance & warranty (fields 39-42) ---
  ce_marking: true,
  eu_declaration_of_conformity_url: '',
  warranty_period_months: 96,
  ce_certificate_number: ''
};

export default function Dashboard() {
  const [passports, setPassports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification State
  const [verifySearch, setVerifySearch] = useState('');
  const [verifyReport, setVerifyReport] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showVerifyInspector, setShowVerifyInspector] = useState(false);

  // Anchor Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [ownerAddress, setOwnerAddress] = useState('0x90F8bf651CD6E14194be49419867557dEd3e94a1'); // Mock wallet default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anchorSuccess, setAnchorSuccess] = useState<any | null>(null);
  const [anchorError, setAnchorError] = useState<string | null>(null);

  // Selected JSON view
  const [viewJson, setViewJson] = useState<any | null>(null);

  useEffect(() => {
    fetchPassports();
  }, []);

  const fetchPassports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/passports');
      if (!res.ok) throw new Error('Failed to fetch battery passports list.');
      const data = await res.json();
      setPassports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    const sn = `SN-ADI-${rand}`;
    setFormData({
      adi: `acc://acme-ev.adi/battery/${sn}`,
      battery_serial_number: sn,
      battery_model: 'ACME-LION-X1',
      manufacturer_name: 'ACME Batteries Corp',
      manufacturer_id: 'EORI-US998877',
      manufacturing_date: new Date().toISOString().split('T')[0],
      manufacturing_place: 'Austin, Texas',
      battery_category: 'EV',
      battery_status: 'original',

      battery_weight_kg: 480.5,
      chemistry: 'NMC-811',
      nominal_voltage_v: 450.0,
      nominal_capacity_ah: 180.0,
      energy_capacity_kwh: 81.0,
      rated_capacity_ah: 180.0,
      power_capability_w: 220000.0,
      internal_resistance_mohm: 1.15,
      expected_lifetime_cycles: 2500,
      state_of_health_percent: 100.0,
      state_of_charge_percent: 85.0,
      depth_of_discharge_percent: 0.0,
      temperature_range_min_c: -25.0,
      temperature_range_max_c: 60.0,
      round_trip_efficiency_percent: 97.2,
      capacity_fade_percent: 0.0,

      hazardous_substances: 'Lead-free, RoHS compliant electrolyte.',
      critical_raw_materials: 'Cobalt, Lithium, Nickel, Manganese.',
      cobalt_percent: 10.5,
      lithium_percent: 4.8,
      nickel_percent: 62.5,
      lead_percent: 0.0,
      recycled_cobalt_percent: 15.0,
      recycled_lithium_percent: 8.0,
      recycled_nickel_percent: 20.0,
      recycled_lead_percent: 0.0,
      carbon_footprint_kgco2e: 2150.0,
      carbon_footprint_class: 'A',
      renewable_content_percent: 30.0,
      collection_recycling_info: 'Authorized collection recycling point required.',

      ce_marking: true,
      eu_declaration_of_conformity_url: `https://acme-ev.adi/compliance/doc-${sn}`,
      warranty_period_months: 96,
      ce_certificate_number: `CE-CERT-${rand}-NMC`
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let typedVal: any = value;
    
    if (type === 'number') {
      typedVal = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      typedVal = (e.target as HTMLInputElement).checked;
    } else if (value === 'true') {
      typedVal = true;
    } else if (value === 'false') {
      typedVal = false;
    }

    setFormData(prev => ({
      ...prev,
      [name]: typedVal
    }));
  };

  const handleAnchorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAnchorError(null);
    setAnchorSuccess(null);

    try {
      const res = await fetch('/api/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: formData, ownerAddress })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to anchor battery passport on-chain.');
      }

      setAnchorSuccess(data);
      setFormData(INITIAL_FORM_STATE);
      fetchPassports();
    } catch (err: any) {
      setAnchorError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyQuery = async (serial: string) => {
    if (!serial) return;
    setIsVerifying(true);
    setVerifyError(null);
    setVerifyReport(null);
    setShowVerifyInspector(false);

    try {
      const res = await fetch(`/api/verify?serial=${encodeURIComponent(serial)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete verification query.');
      }

      setVerifyReport(data);
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div>
          <h1>Battery Passport Portal</h1>
          <p>Sovereign EVM-Anchored Real-World Asset (RWA) Registry on ADI Chain</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setAnchorSuccess(null); setAnchorError(null); setIsModalOpen(true); }}>
          Anchor New Battery
        </button>
      </header>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Anchored</div>
          <div className="metric-value">{isLoading ? '...' : passports.length}</div>
          <div className="metric-desc">Batteries registered on-chain</div>
        </div>
        <div className="metric-card valid">
          <div className="metric-label">Network Status</div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.75rem', paddingTop: '0.5rem' }}>Active</div>
          <div className="metric-desc">ADI Network Testnet (99999)</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Database Store</div>
          <div className="metric-value" style={{ fontSize: '1.75rem', paddingTop: '0.5rem' }}>Supabase</div>
          <div className="metric-desc">PostgreSQL backend integration</div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="dashboard-layout">
        
        {/* Left Column: List of Passports */}
        <div>
          <div className="panel">
            <div className="panel-header">
              <h2>Registered Battery Passports</h2>
              <button className="btn btn-secondary" onClick={fetchPassports} disabled={isLoading}>
                Refresh List
              </button>
            </div>

            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading database records...</div>
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : passports.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No battery passports found in the database. Deploy your contract and click "Anchor New Battery" to register.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Serial Number</th>
                      <th>Token ID</th>
                      <th>ADI Identifier</th>
                      <th>On-Chain Reference</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passports.map((p) => (
                      <tr key={p.serial_number}>
                        <td style={{ fontWeight: '600' }}>{p.serial_number}</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>#{p.token_id}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.adi}</td>
                        <td>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            Hash: {p.db_sha256_hash.substring(0, 10)}...
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setViewJson(p.document)}>
                              View JSON
                            </button>
                            <button className="btn btn-emerald" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#070a13' }} onClick={() => { setVerifySearch(p.serial_number); handleVerifyQuery(p.serial_number); }}>
                              Audit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Tool */}
        <div>
          <div className="panel">
            <h2>Cryptographic Audit Tool</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
              Queries the ADI Chain to verify whether the database record matches the immutable anchored fingerprint.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="verifySearchInput">Enter Battery Serial Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="verifySearchInput"
                  type="text"
                  className="form-input"
                  placeholder="e.g. SN-ADI-12345"
                  value={verifySearch}
                  onChange={(e) => setVerifySearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => handleVerifyQuery(verifySearch)} disabled={isVerifying || !verifySearch}>
                  {isVerifying ? 'Auditing...' : 'Audit'}
                </button>
              </div>
            </div>

            {verifyError && <div className="alert alert-error">{verifyError}</div>}

            {verifyReport && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
                <div className={`alert ${verifyReport.is_valid ? 'alert-success' : 'alert-error'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                  <span>INTEGRITY VERDICT:</span>
                  <span className={`badge ${verifyReport.is_valid ? 'badge-valid' : 'badge-tampered'}`} style={{ fontSize: '0.9rem', color: '#070a13' }}>
                    {verifyReport.verdict}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Token ID:</span>
                    <span style={{ fontFamily: 'monospace' }}>#{verifyReport.token_id}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Battery ADI:</span>
                    <span>{verifyReport.adi}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Computed Hash (DB):</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--accent-cyan)' }}>{verifyReport.computed_hash}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Anchored Hash (Chain):</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', color: verifyReport.is_valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {verifyReport.anchored_hash}
                    </span>
                  </div>
                  {verifyReport.timestamp > 0 && (
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Anchoring Timestamp:</span>
                      <span>{new Date(verifyReport.timestamp * 1000).toLocaleString()}</span>
                    </div>
                  )}
                  {verifyReport.contract_address && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--card-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: '500' }}>Blockchain Explorer:</span>
                      <a 
                        href={`https://explorer.ab.testnet.adifoundation.ai/address/${verifyReport.contract_address}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontSize: '0.8rem', fontWeight: '500' }}
                      >
                        View Contract & Tokens on ADI Explorer ↗
                      </a>
                    </div>
                  )}

                  {/* Non-Technical Human Readable Certificate */}
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: verifyReport.is_valid ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                    border: verifyReport.is_valid ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{verifyReport.is_valid ? '🛡️' : '⚠️'}</span>
                      <strong style={{ fontSize: '0.9rem', color: verifyReport.is_valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {verifyReport.is_valid ? 'Authenticity Certificate' : 'Security Alert: Tampering Detected'}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                      {verifyReport.is_valid ? (
                        <>
                          This verifies that the battery information in the database is <strong>100% authentic</strong>. 
                          The unique digital fingerprint (SHA-256) of your current database data matches the immutable signature permanently recorded on the blockchain in contract <strong>{verifyReport.contract_address.slice(0,6)}...{verifyReport.contract_address.slice(-4)}</strong>. 
                          If anyone had edited a single number, date, or character in the database, the fingerprints would not match, and this tool would fail.
                        </>
                      ) : (
                        <>
                          The battery data in the database does <strong>NOT</strong> match the immutable version anchored on the blockchain. 
                          This means the record has been modified or edited after it was registered. Do not trust the data shown in this database.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Collapsible Manual Verification Helper */}
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)' }}
                      onClick={() => setShowVerifyInspector(!showVerifyInspector)}
                    >
                      <span>🔍 Verify Fingerprint Hash Manually?</span>
                      <span>{showVerifyInspector ? '▲' : '▼'}</span>
                    </button>

                    {showVerifyInspector && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--card-border)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <p style={{ marginBottom: '0.75rem', lineHeight: '1.4' }}>
                          This system generates a hash mathematically from the battery's structured JSON data. You can copy the exact text representation below and paste it into any independent third-party SHA-256 hash calculator to audit the proof.
                        </p>

                        <div style={{ marginBottom: '0.75rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                            1. Copy this Canonical JSON text:
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <textarea 
                              readOnly
                              value={verifyReport.canonical_json}
                              style={{ 
                                flex: 1, 
                                height: '60px', 
                                fontFamily: 'monospace', 
                                fontSize: '0.7rem', 
                                background: '#070a13', 
                                color: 'var(--accent-cyan)', 
                                border: '1px solid var(--card-border)', 
                                padding: '0.4rem', 
                                borderRadius: '4px',
                                resize: 'none'
                              }}
                            />
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                              onClick={(e) => {
                                navigator.clipboard.writeText(verifyReport.canonical_json);
                                const btn = e.currentTarget;
                                const originalText = btn.innerText;
                                btn.innerText = 'Copied!';
                                setTimeout(() => btn.innerText = originalText, 1500);
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                            2. Verify on an independent website:
                          </span>
                          <p style={{ lineHeight: '1.4', marginBottom: '0.5rem' }}>
                            Paste the text above into a public SHA-256 calculator tool like:
                          </p>
                          <a 
                            href="https://sha256.cz/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', display: 'block', marginBottom: '0.5rem' }}
                          >
                            🔗 sha256.cz (External Tool) ↗
                          </a>
                          <p style={{ lineHeight: '1.4' }}>
                            The calculated result will be exactly:
                            <code style={{ 
                              display: 'block', 
                              marginTop: '0.25rem', 
                              padding: '0.4rem', 
                              background: '#070a13', 
                              borderRadius: '4px', 
                              fontFamily: 'monospace', 
                              color: 'var(--accent-emerald)',
                              wordBreak: 'break-all',
                              fontSize: '0.75rem'
                            }}>
                              {verifyReport.computed_hash}
                            </code>
                          </p>
                        </div>

                        <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--card-border)', paddingTop: '0.75rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                            3. Read the Document Hash Directly from the Blockchain Contract:
                          </span>
                          <p style={{ lineHeight: '1.4', marginBottom: '0.5rem' }}>
                            If you don't want to decode raw transaction data, you can query the smart contract state directly on the explorer:
                          </p>
                          <a 
                            href={`https://explorer.ab.testnet.adifoundation.ai/address/${verifyReport.contract_address}?tab=read_contract`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
                          >
                            🔗 Query Contract on ADI Explorer (Read Tab) ↗
                          </a>
                          <p style={{ lineHeight: '1.4' }}>
                            On the explorer page, find the <strong>getPassportDetails</strong> function, enter <code>{verifyReport.token_id}</code> as the tokenId, and click <strong>Query</strong>. The blockchain contract will return the variables stored in its state, showing the exact Document Hash:
                            <code style={{ display: 'block', marginTop: '0.25rem', padding: '0.4rem', background: '#070a13', borderRadius: '4px', fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                              {verifyReport.computed_hash}
                            </code>
                            This allows anyone to audit the registered hash directly from the contract ledger.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* JSON Viewer Modal */}
      {viewJson && (
        <div className="modal-overlay" onClick={() => setViewJson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Passport JSON Payload</h2>
              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setViewJson(null)}>✕</button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(viewJson, null, 2)}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewJson(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Register / Anchor Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Anchor Battery Passport</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={handleAutofill} disabled={isSubmitting}>
                  Autofill Mock Data
                </button>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>✕</button>
              </div>
            </div>

            <form onSubmit={handleAnchorSubmit}>
              <div className="modal-body">
                {anchorError && <div className="alert alert-error">{anchorError}</div>}
                
                {anchorSuccess ? (
                  <div className="alert alert-success">
                    <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Anchoring Successful!</h3>
                    <p style={{ marginBottom: '0.5rem' }}>The battery RWA token has been successfully minted on the ADI Chain testnet.</p>
                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      <div><strong>Token ID:</strong> #{anchorSuccess.tokenId}</div>
                      <div><strong>Tx Hash:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{anchorSuccess.txHash}</span></div>
                      <div><strong>SHA-256 Hash:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{anchorSuccess.hash}</span></div>
                      {anchorSuccess.txHash && (
                        <div style={{ marginTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <a 
                            href={`https://explorer.ab.testnet.adifoundation.ai/tx/${anchorSuccess.txHash}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontSize: '0.8rem', fontWeight: '500' }}
                          >
                            View Transaction on ADI Explorer ↗
                          </a>
                          {anchorSuccess.contractAddress && (
                            <a 
                              href={`https://explorer.ab.testnet.adifoundation.ai/address/${anchorSuccess.contractAddress}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.75rem', opacity: 0.8 }}
                            >
                              View Contract & Tokens on ADI Explorer ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px dashed var(--card-border)' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="ownerAddressInput">Recipient EVM Wallet Address (RWA Owner)</label>
                        <input
                          id="ownerAddressInput"
                          type="text"
                          className="form-input"
                          name="ownerAddress"
                          required
                          value={ownerAddress}
                          onChange={(e) => setOwnerAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Section 1 */}
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.25rem' }}>
                      1. Identity & Provenance
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="adiInput">ADI URI Identifier</label>
                        <input id="adiInput" type="text" className="form-input" name="adi" required value={formData.adi} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="serialInput">Battery Serial Number</label>
                        <input id="serialInput" type="text" className="form-input" name="battery_serial_number" required value={formData.battery_serial_number} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="modelInput">Battery Model</label>
                        <input id="modelInput" type="text" className="form-input" name="battery_model" required value={formData.battery_model} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="manNameInput">Manufacturer Name</label>
                        <input id="manNameInput" type="text" className="form-input" name="manufacturer_name" required value={formData.manufacturer_name} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="manIdInput">Manufacturer ID</label>
                        <input id="manIdInput" type="text" className="form-input" name="manufacturer_id" required value={formData.manufacturer_id} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="manDateInput">Manufacturing Date</label>
                        <input id="manDateInput" type="date" className="form-input" name="manufacturing_date" required value={formData.manufacturing_date} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="manPlaceInput">Manufacturing Place</label>
                        <input id="manPlaceInput" type="text" className="form-input" name="manufacturing_place" required value={formData.manufacturing_place} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="categorySelect">Battery Category</label>
                        <select id="categorySelect" className="form-input" name="battery_category" value={formData.battery_category} onChange={handleFormChange}>
                          <option value="EV">EV</option>
                          <option value="industrial">industrial</option>
                          <option value="LMT">LMT</option>
                          <option value="portable">portable</option>
                          <option value="SLI">SLI</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="statusSelect">Battery Status</label>
                      <select id="statusSelect" className="form-input" name="battery_status" value={formData.battery_status} onChange={handleFormChange}>
                        <option value="original">original</option>
                        <option value="repurposed">repurposed</option>
                        <option value="reused">reused</option>
                        <option value="recycled">recycled</option>
                        <option value="waste">waste</option>
                      </select>
                    </div>

                    {/* Section 2 */}
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.25rem' }}>
                      2. Physical & Electrochemical
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="weightInput">Weight (kg)</label>
                        <input id="weightInput" type="number" step="any" className="form-input" name="battery_weight_kg" required value={formData.battery_weight_kg} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="chemistryInput">Chemistry</label>
                        <input id="chemistryInput" type="text" className="form-input" name="chemistry" required value={formData.chemistry} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="voltageInput">Nominal Voltage (V)</label>
                        <input id="voltageInput" type="number" step="any" className="form-input" name="nominal_voltage_v" required value={formData.nominal_voltage_v} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="capacityInput">Nominal Capacity (Ah)</label>
                        <input id="capacityInput" type="number" step="any" className="form-input" name="nominal_capacity_ah" required value={formData.nominal_capacity_ah} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="energyInput">Energy Capacity (kWh)</label>
                        <input id="energyInput" type="number" step="any" className="form-input" name="energy_capacity_kwh" required value={formData.energy_capacity_kwh} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="ratedInput">Rated Capacity (Ah)</label>
                        <input id="ratedInput" type="number" step="any" className="form-input" name="rated_capacity_ah" required value={formData.rated_capacity_ah} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="powerInput">Power Capability (W)</label>
                        <input id="powerInput" type="number" step="any" className="form-input" name="power_capability_w" required value={formData.power_capability_w} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="resistanceInput">Internal Resistance (mΩ)</label>
                        <input id="resistanceInput" type="number" step="any" className="form-input" name="internal_resistance_mohm" required value={formData.internal_resistance_mohm} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="lifetimeInput">Expected Lifetime (cycles)</label>
                        <input id="lifetimeInput" type="number" className="form-input" name="expected_lifetime_cycles" required value={formData.expected_lifetime_cycles} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="sohInput">State of Health (%)</label>
                        <input id="sohInput" type="number" step="any" className="form-input" name="state_of_health_percent" required value={formData.state_of_health_percent} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="socInput">State of Charge (%)</label>
                        <input id="socInput" type="number" step="any" className="form-input" name="state_of_charge_percent" required value={formData.state_of_charge_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="dodInput">Depth of Discharge (%)</label>
                        <input id="dodInput" type="number" step="any" className="form-input" name="depth_of_discharge_percent" required value={formData.depth_of_discharge_percent} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="tempMinInput">Min Temperature Range (°C)</label>
                        <input id="tempMinInput" type="number" step="any" className="form-input" name="temperature_range_min_c" required value={formData.temperature_range_min_c} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="tempMaxInput">Max Temperature Range (°C)</label>
                        <input id="tempMaxInput" type="number" step="any" className="form-input" name="temperature_range_max_c" required value={formData.temperature_range_max_c} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="efficiencyInput">Round-Trip Efficiency (%)</label>
                        <input id="efficiencyInput" type="number" step="any" className="form-input" name="round_trip_efficiency_percent" required value={formData.round_trip_efficiency_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="fadeInput">Capacity Fade (%)</label>
                        <input id="fadeInput" type="number" step="any" className="form-input" name="capacity_fade_percent" required value={formData.capacity_fade_percent} onChange={handleFormChange} />
                      </div>
                    </div>

                    {/* Section 3 */}
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.25rem' }}>
                      3. Materials & Sustainability
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="hazardousInput">Hazardous Substances Summary</label>
                        <input id="hazardousInput" type="text" className="form-input" name="hazardous_substances" required value={formData.hazardous_substances} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="crmsInput">Critical Raw Materials Summary</label>
                        <input id="crmsInput" type="text" className="form-input" name="critical_raw_materials" required value={formData.critical_raw_materials} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="cobaltInput">Cobalt Content (%)</label>
                        <input id="cobaltInput" type="number" step="any" className="form-input" name="cobalt_percent" required value={formData.cobalt_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="lithiumInput">Lithium Content (%)</label>
                        <input id="lithiumInput" type="number" step="any" className="form-input" name="lithium_percent" required value={formData.lithium_percent} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="nickelInput">Nickel Content (%)</label>
                        <input id="nickelInput" type="number" step="any" className="form-input" name="nickel_percent" required value={formData.nickel_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="leadInput">Lead Content (%)</label>
                        <input id="leadInput" type="number" step="any" className="form-input" name="lead_percent" required value={formData.lead_percent} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="recCobaltInput">Recycled Cobalt (%)</label>
                        <input id="recCobaltInput" type="number" step="any" className="form-input" name="recycled_cobalt_percent" required value={formData.recycled_cobalt_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="recLithiumInput">Recycled Lithium (%)</label>
                        <input id="recLithiumInput" type="number" step="any" className="form-input" name="recycled_lithium_percent" required value={formData.recycled_lithium_percent} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="recNickelInput">Recycled Nickel (%)</label>
                        <input id="recNickelInput" type="number" step="any" className="form-input" name="recycled_nickel_percent" required value={formData.recycled_nickel_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="recLeadInput">Recycled Lead (%)</label>
                        <input id="recLeadInput" type="number" step="any" className="form-input" name="recycled_lead_percent" required value={formData.recycled_lead_percent} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="carbonInput">Carbon Footprint (kgCO2e)</label>
                        <input id="carbonInput" type="number" step="any" className="form-input" name="carbon_footprint_kgco2e" required value={formData.carbon_footprint_kgco2e} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="classInput">Carbon Footprint Class (A-G)</label>
                        <input id="classInput" type="text" className="form-input" name="carbon_footprint_class" required value={formData.carbon_footprint_class} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="renewableInput">Renewable Content (%)</label>
                        <input id="renewableInput" type="number" step="any" className="form-input" name="renewable_content_percent" required value={formData.renewable_content_percent} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="recyclingInfoInput">Collection & Recycling Instructions</label>
                        <input id="recyclingInfoInput" type="text" className="form-input" name="collection_recycling_info" required value={formData.collection_recycling_info} onChange={handleFormChange} />
                      </div>
                    </div>

                    {/* Section 4 */}
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.25rem' }}>
                      4. Compliance & Warranty
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="ceSelect">CE Marking Present</label>
                        <select id="ceSelect" className="form-input" name="ce_marking" value={formData.ce_marking ? 'true' : 'false'} onChange={handleFormChange}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="docUrlInput">EU Declaration of Conformity URL</label>
                        <input id="docUrlInput" type="text" className="form-input" name="eu_declaration_of_conformity_url" required value={formData.eu_declaration_of_conformity_url} onChange={handleFormChange} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="warrantyInput">Warranty Period (months)</label>
                        <input id="warrantyInput" type="number" className="form-input" name="warranty_period_months" required value={formData.warranty_period_months} onChange={handleFormChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="certNoInput">CE Certificate Number</label>
                        <input id="certNoInput" type="text" className="form-input" name="ce_certificate_number" required value={formData.ce_certificate_number} onChange={handleFormChange} />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                {anchorSuccess ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Close
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Anchoring...' : 'Anchor to ADI Testnet'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
