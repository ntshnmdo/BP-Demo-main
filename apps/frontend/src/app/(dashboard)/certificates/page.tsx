'use client';

import { Award, ShieldCheck, Calendar, Filter } from 'lucide-react';

const mockCertificates = [
  { id: '1', type: 'UN38.3', batteryId: 'BAT-2024-000001', model: 'VoltPack Ultra 100', issuer: 'TÜV SÜD', status: 'VALID', date: '2024-01-10' },
  { id: '2', type: 'CE', batteryId: 'BAT-2024-000001', model: 'VoltPack Ultra 100', issuer: 'TÜV SÜD', status: 'VALID', date: '2024-01-10' },
  { id: '3', type: 'UN38.3', batteryId: 'BAT-2024-000002', model: 'EcoPower Industrial 200', issuer: 'SGS Lab', status: 'VALID', date: '2024-02-15' },
  { id: '4', type: 'REACH', batteryId: 'BAT-2024-000002', model: 'EcoPower Industrial 200', issuer: 'SGS Lab', status: 'VALID', date: '2024-02-15' },
  { id: '5', type: 'CE', batteryId: 'BAT-2024-000003', model: 'VoltPack Sport 75', issuer: 'Bureau Veritas', status: 'VALID', date: '2024-03-01' },
];

export default function CertificatesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Certificates</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Overview of all safety, chemical, and transportation standards certificates in the system
          </p>
        </div>
      </div>

      {/* Filter / search placeholder */}
      <div className="flex gap-3">
        <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-slate-500 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter options (Search by Certificate Type, Battery ID, or Lab)
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 border-b border-slate-700/40">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Type / Standard</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Battery Model</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Battery ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Issuer / Lab</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400">Issue Date</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {mockCertificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-slate-800/10">
                <td className="px-4 py-3 text-slate-200 font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  {cert.type}
                </td>
                <td className="px-4 py-3 text-slate-300">{cert.model}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{cert.batteryId}</td>
                <td className="px-4 py-3 text-slate-400">{cert.issuer}</td>
                <td className="px-4 py-3 text-slate-500 font-mono">{cert.date}</td>
                <td className="px-4 py-3 text-right">
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                    {cert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
