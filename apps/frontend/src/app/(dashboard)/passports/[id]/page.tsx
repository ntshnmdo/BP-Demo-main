'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  usePassport,
  useSubmitPassport,
  useApprovePassport,
  useRejectPassport,
  usePublishPassport,
} from '@/lib/hooks/usePassports';
import { useAuthStore } from '@/lib/store/authStore';
import { PassportStatusBadge } from '@/components/passport/PassportStatusBadge';
import WorkflowTimeline from '@/components/passport/WorkflowTimeline';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Leaf,
  ShieldAlert,
  ClipboardList,
  Compass,
  FileDown,
  Globe,
  Upload,
  Link2,
  Trash2,
  Check,
  X,
  Lock,
  RefreshCw,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Copy,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { verifyPassport } from '@/lib/api/passports';
import QRCode from 'react-qr-code';

export default function PassportDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'carbon' | 'compliance' | 'circularity' | 'audit'>('overview');
  
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const [showQRModal, setShowQRModal] = useState(false);

  const getQRValue = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin + `/public-passport/${id}`;
    }
    return `https://passport.batterypassport.eu/public-passport/${id}`;
  };

  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLocalHash, setCopiedLocalHash] = useState(false);
  const [copiedChainHash, setCopiedChainHash] = useState(false);

  const handleCopyTx = () => {
    if (!passport) return;
    navigator.clipboard.writeText(passport.blockchainTx || '');
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleCopyHash = () => {
    if (!passport) return;
    navigator.clipboard.writeText(passport.blockchainHash || '');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyLocalHash = () => {
    navigator.clipboard.writeText(verificationResult?.currentHash || '');
    setCopiedLocalHash(true);
    setTimeout(() => setCopiedLocalHash(false), 2000);
  };

  const handleCopyChainHash = () => {
    navigator.clipboard.writeText(verificationResult?.storedHash || '');
    setCopiedChainHash(true);
    setTimeout(() => setCopiedChainHash(false), 2000);
  };

  const handleVerifyBlockchain = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyPassport(id);
      setVerificationResult(result);
    } catch (err: any) {
      console.error(err);
      setVerificationResult({
        verified: false,
        message: err.message || 'Verification call failed',
        currentHash: 'Error',
        storedHash: 'Error'
      });
    } finally {
      setVerifying(false);
    }
  };
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: passport, isLoading, error } = usePassport(id);
  const submitMutation = useSubmitPassport();
  const approveMutation = useApproveMutationLocal();
  const rejectMutation = useRejectMutationLocal();
  const publishMutation = usePublishPassport();

  // Standard hooks mapping
  function useApproveMutationLocal() { return useApprovePassport(); }
  function useRejectMutationLocal() { return useRejectPassport(); }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading battery passport details...</p>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="p-6 text-center max-w-lg mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-100">Passport Not Found</h3>
        <p className="text-slate-400 text-sm">
          The battery passport you are trying to view does not exist or you do not have permission.
        </p>
        <button
          onClick={() => router.push('/passports')}
          className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          Back to Passports
        </button>
      </div>
    );
  }

  const handleAction = async (action: 'submit' | 'approve' | 'reject' | 'publish') => {
    try {
      if (action === 'submit') {
        await submitMutation.mutateAsync(id);
      } else if (action === 'approve') {
        await approveMutation.mutateAsync(id);
      } else if (action === 'publish') {
        await publishMutation.mutateAsync(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner = passport.createdById === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  // Permission logic for actions
  const showSubmit = isOwner && (passport.status === 'DRAFT' || passport.status === 'REJECTED');
  const showApproveReject = isAdmin && passport.status === 'SUBMITTED';
  const showPublish = isAdmin && passport.status === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/passports')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-100 font-mono">{passport.passportId}</h1>
              <PassportStatusBadge status={passport.status} />
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Model: {passport.model} · Serial: {passport.serialNumber}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {showSubmit && (
            <button
              onClick={() => handleAction('submit')}
              disabled={submitMutation.isPending}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Submit for Approval
            </button>
          )}

          {showApproveReject && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Reject Passport
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={approveMutation.isPending}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Approve Passport
              </button>
            </>
          )}

          {showPublish && (
            <button
              onClick={() => handleAction('publish')}
              disabled={publishMutation.isPending}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              Publish Passport
            </button>
          )}

          <Link
            href={`/public-passport/${passport.id}`}
            target="_blank"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            {passport.status === 'PUBLISHED' ? 'Public View' : 'Preview Public View'}
          </Link>
          {passport.status === 'PUBLISHED' && (
            <button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              Show QR Code
            </button>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner */}
      {passport.status === 'REJECTED' && passport.rejectionReason && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <span className="font-semibold">Rejection reason:</span> {passport.rejectionReason}
        </div>
      )}

      {/* Progress Timeline */}
      <div className="glass-card rounded-xl p-6 border border-slate-700/30">
        <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-6">Workflow Progress</h3>
        <WorkflowTimeline
          status={passport.status}
          submittedAt={passport.submittedAt}
          approvedAt={passport.approvedAt}
          publishedAt={passport.publishedAt}
        />
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {(
            [
              { id: 'overview', label: 'Overview', icon: Compass },
              { id: 'materials', label: 'Material Composition', icon: Layers },
              { id: 'carbon', label: 'Carbon footprint', icon: Leaf },
              { id: 'compliance', label: 'Compliance & Certs', icon: ShieldAlert },
              { id: 'circularity', label: 'Circularity & Warranty', icon: RefreshCw },
              { id: 'audit', label: 'Audit Trail & Logs', icon: ClipboardList },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-950/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}

          {/* Blockchain Card verification widget */}
          {passport.blockchainHash && (
            <div className="mt-6 p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Blockchain Secured</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This passport data is sealed on the blockchain ledger. Integrity verification is active.
              </p>
              
              <button
                onClick={handleVerifyBlockchain}
                disabled={verifying}
                className="w-full py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/35 disabled:bg-emerald-800/10 disabled:text-emerald-600 disabled:border-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Verifying Integrity...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    Verify On-Chain Integrity
                  </>
                )}
              </button>

              {verificationResult && (
                <div className={`p-2.5 rounded-lg border text-[10px] space-y-1.5 ${
                  verificationResult.verified 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <div className="flex items-center gap-1 font-bold">
                    {verificationResult.verified ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    {verificationResult.verified ? 'Integrity Verified!' : 'Tampering Detected!'}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    {verificationResult.message}
                  </p>
                  <div className="font-mono text-[8px] space-y-1 text-slate-500 border-t border-slate-700/30 pt-1.5 mt-1">
                    <div className="flex items-center justify-between gap-1 group">
                      <span className="truncate flex-1" title={verificationResult.currentHash}>Local: {verificationResult.currentHash}</span>
                      <button
                        onClick={handleCopyLocalHash}
                        className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy Local Hash"
                      >
                        {copiedLocalHash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-1 group">
                      <span className="truncate flex-1" title={verificationResult.storedHash}>Chain: {verificationResult.storedHash}</span>
                      <button
                        onClick={handleCopyChainHash}
                        className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy Chain Hash"
                      >
                        {copiedChainHash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 font-mono text-[9px] text-slate-500 border-t border-slate-800/40 pt-2">
                <div className="flex items-center justify-between gap-1 group">
                  <span className="truncate flex-1" title={passport.blockchainTx}>TX: {passport.blockchainTx}</span>
                  <button
                    onClick={handleCopyTx}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy Transaction Hash"
                  >
                    {copiedTx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1 group">
                  <span className="truncate flex-1" title={passport.blockchainHash}>Hash: {passport.blockchainHash}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy Data Hash"
                  >
                    {copiedHash ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 glass-card rounded-xl p-6 border border-slate-700/30 min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Battery Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Model Name</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.model}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Battery Category</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.batteryType}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Electrochemical Chemistry</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.chemistry}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Serial Number</p>
                  <p className="text-slate-200 font-semibold font-mono mt-1">{passport.serialNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Country of Origin</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.countryOfOrigin || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Production Date</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.productionDate ? formatDate(passport.productionDate) : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Capacity</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.capacityKwh ? `${passport.capacityKwh} kWh` : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Nominal Voltage</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.nominalVoltageV ? `${passport.nominalVoltageV} V` : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Intended Use</p>
                  <p className="text-slate-200 font-semibold mt-1">{passport.intendedUse || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Material Composition</h3>
              {passport.materials && Array.isArray(passport.materials) && passport.materials.length > 0 ? (
                <div className="border border-slate-700/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50 border-b border-slate-700/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Material</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Percentage</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Origin</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Supplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {passport.materials.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="px-4 py-3 text-slate-200 font-medium">{item.material || item.name}</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold font-mono">{item.percentage}%</td>
                          <td className="px-4 py-3 text-slate-400">{item.origin || item.originCountry}</td>
                          <td className="px-4 py-3 text-slate-400">{item.supplier || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">No material composition declared.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'carbon' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Carbon & GHG Footprint</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                  <p className="text-slate-500 text-xs font-semibold">Total Carbon Intensity</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1.5">
                    {passport.carbonFootprintKgCo2eKwh ? `${passport.carbonFootprintKgCo2eKwh} kg/kWh` : '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                  <p className="text-slate-500 text-xs font-semibold">GHG Emissions</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1.5">
                    {passport.ghgEmissions ? `${passport.ghgEmissions} t` : '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                  <p className="text-slate-500 text-xs font-semibold">Facility Site Emissions</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1.5">
                    {passport.manufacturingSiteEmissions ? `${passport.manufacturingSiteEmissions} t` : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Safety Certifications</h3>
              {passport.certificates && passport.certificates.length > 0 ? (
                <div className="space-y-3">
                  {passport.certificates.map((cert: any) => (
                    <div key={cert.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/40">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{cert.type}</h4>
                        <p className="text-xs text-slate-500 mt-1">Issuer: {cert.issuer} · Issued: {formatDate(cert.issuedDate)}</p>
                      </div>
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                        {cert.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">No safety certificates listed.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'circularity' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Circularity & Warranty</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                  <p className="text-slate-500 text-xs font-semibold">Circularity Score</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1.5">
                    {passport.circularityScore ? `${passport.circularityScore}/100` : '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                  <p className="text-slate-500 text-xs font-semibold">Recycled Content</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1.5">
                    {passport.recycledContentPercent ? `${passport.recycledContentPercent}%` : '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                  <p className="text-slate-500 text-xs font-semibold">Warranty Mileage</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1.5">
                    {passport.warrantyKm ? `${passport.warrantyKm.toLocaleString()} km` : '—'}
                  </p>
                </div>
              </div>

              {passport.recyclingInformation && (
                <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recycling Guidance</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{passport.recyclingInformation}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Passport Activity & Audit Trail</h3>
              {passport.auditLogs && passport.auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {passport.auditLogs.map((log: any) => (
                    <div key={log.id} className="relative pl-6 border-l border-slate-700">
                      <div className="absolute top-1.5 -left-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div className="text-xs">
                        <p className="text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString()}</p>
                        <p className="text-slate-200 mt-1 font-semibold">{log.details}</p>
                        <p className="text-slate-500 mt-0.5">Actor: {log.actor?.name || 'System'} ({log.action})</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <p className="text-slate-500 text-sm">No activity logs recorded.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200">Reject Battery Passport</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason for Rejection</label>
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Specify why this battery passport request does not comply with regulations..."
                  className="form-input py-2"
                />
              </div>
              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200">EU Registry QR Tag</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <p className="text-xs text-slate-400">Scan this QR Code to view the public registry details of this battery.</p>
              
              <div className="p-4 bg-white rounded-xl shadow-inner border border-slate-200">
                <QRCode
                  value={getQRValue()}
                  size={160}
                  level="M"
                  style={{ display: 'block' }}
                />
              </div>

              <div className="w-full text-left text-xs border-t border-slate-800/80 pt-4 space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Passport ID:</span>
                  <span className="font-semibold text-slate-200">{passport.passportId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="font-semibold text-slate-200">{passport.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serial:</span>
                  <span className="font-semibold text-slate-200">{passport.serialNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
