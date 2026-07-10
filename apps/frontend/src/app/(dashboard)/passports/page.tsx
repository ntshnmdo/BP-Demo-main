'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePassports, useDeletePassport } from '@/lib/hooks/usePassports';
import { PassportStatusBadge } from '@/components/passport/PassportStatusBadge';
import { cn, formatDate } from '@/lib/utils';
import { PassportStatus, ChemistryType } from '@/lib/api/passports';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  QrCode,
  X,
} from 'lucide-react';
import QRCode from 'react-qr-code';

const STATUS_OPTIONS: { value: PassportStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
];

const CHEMISTRY_OPTIONS: { value: ChemistryType | ''; label: string }[] = [
  { value: '', label: 'All Chemistries' },
  { value: 'NMC', label: 'NMC' },
  { value: 'LFP', label: 'LFP' },
  { value: 'NCA', label: 'NCA' },
  { value: 'LMO', label: 'LMO' },
  { value: 'LTO', label: 'LTO' },
  { value: 'OTHER', label: 'Other' },
];

export default function PassportsPage() {
  const router = useRouter();
  const deleteMutation = useDeletePassport();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PassportStatus | ''>('');
  const [chemistry, setChemistry] = useState<ChemistryType | ''>('');
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    console.log('handleDelete invoked with id:', id);
    try {
      await deleteMutation.mutateAsync(id);
      setConfirmDeleteId(null);
      setActiveMenuId(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete battery passport.');
      setConfirmDeleteId(null);
    }
  };

  const { data, isLoading } = usePassports({
    search: search || undefined,
    status: status || undefined,
    chemistry: chemistry || undefined,
    page,
    limit: 10,
  });

  const passports = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Battery Passports</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} passport{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Link
          href="/passports/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Passport
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Passport ID, Model, Serial..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as PassportStatus | ''); setPage(1); }}
              className="form-input pr-10 appearance-none min-w-[160px] cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Chemistry Filter */}
          <div className="relative">
            <select
              value={chemistry}
              onChange={(e) => { setChemistry(e.target.value as ChemistryType | ''); setPage(1); }}
              className="form-input pr-10 appearance-none min-w-[160px] cursor-pointer"
            >
              {CHEMISTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Passport ID</th>
                <th>Model</th>
                <th>Battery Type</th>
                <th>Chemistry</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Last Updated</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}><div className="skeleton h-4 w-20 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : passports.map((passport, idx) => (
                    <tr
                      key={passport.id}
                      className="cursor-pointer hover:bg-slate-800/10 transition-colors"
                      onClick={() => router.push(`/passports/${passport.id}`)}
                    >
                      <td>
                        <span className="font-mono text-emerald-400 text-xs font-semibold">
                          {passport.passportId}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-slate-200 font-medium text-sm">{passport.model}</p>
                          <p className="text-slate-500 text-xs font-mono">{passport.serialNumber}</p>
                        </div>
                      </td>
                      <td>
                        <span className="text-slate-300 text-sm">{passport.batteryType}</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                          {passport.chemistry}
                        </span>
                      </td>
                      <td>
                        <PassportStatusBadge status={passport.status} />
                      </td>
                      <td>
                        <span className="text-slate-400 text-sm">{passport.createdByName || '—'}</span>
                      </td>
                      <td>
                        <span className="text-slate-400 text-xs">{formatDate(passport.updatedAt)}</span>
                      </td>
                      <td className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Eye = Public Preview */}
                          <button
                            onClick={() => window.open(`/public-passport/${passport.id}`, '_blank')}
                            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Public Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* QR Code = Show QR for Published */}
                          {passport.status === 'PUBLISHED' && (
                            <button
                              onClick={() => setShowQRModal(passport.id)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                              title="Show QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                          {/* Pencil = Edit */}
                          <button
                            onClick={() => router.push(`/passports/${passport.id}/edit`)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Edit Passport"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === passport.id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(passport.id);
                              }}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-all animate-pulse"
                              title="Click to confirm deletion"
                            >
                              Confirm?
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(passport.id);
                              }}
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete Passport"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!isLoading && passports.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No passports found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search || status || chemistry
                  ? 'Try adjusting your search filters'
                  : 'Create your first battery passport to get started'}
              </p>
              {!search && !status && !chemistry && (
                <Link
                  href="/passports/new"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg btn-primary text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Create Passport
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/30">
            <p className="text-slate-500 text-xs">
              Showing {Math.min((page - 1) * 10 + 1, total)}–{Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
      )}

      {/* QR Code Modal */}
      {showQRModal && (() => {
        const passport = passports.find(p => p.id === showQRModal);
        if (!passport) return null;

        const getQRValue = () => {
          if (typeof window !== 'undefined') {
            return window.location.origin + `/public-passport/${passport.id}`;
          }
          return `https://passport.batterypassport.eu/public-passport/${passport.id}`;
        };

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">EU Registry QR Tag</h3>
                <button
                  onClick={() => setShowQRModal(null)}
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
        );
      })()}
    </div>
  );
}
