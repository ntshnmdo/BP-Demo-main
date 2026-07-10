'use client';

import { ClipboardList, User, ShieldCheck } from 'lucide-react';

const mockLogs = [
  { id: '1', action: 'PASSPORT_PUBLISHED', actor: 'Admin User', email: 'admin@batterypassport.eu', details: 'Battery passport published to public registry: BAT-2024-000001', date: '2024-05-20 14:35:00' },
  { id: '2', action: 'PASSPORT_APPROVED', actor: 'Admin User', email: 'admin@batterypassport.eu', details: 'Passport approved. Data Hash committed to mock chain: BAT-2024-000001', date: '2024-05-19 10:20:00' },
  { id: '3', action: 'CERTIFICATE_UPLOADED', actor: 'Dr. Ingrid Müller', email: 'lab@tuv-testing.de', details: 'Compliance certificate UN38.3 uploaded for battery serial SN-2024-001', date: '2024-05-18 16:45:00' },
  { id: '4', action: 'PASSPORT_SUBMITTED', actor: 'Klaus Weber', email: 'manufacturer@voltaics.de', details: 'Passport submitted for regulatory review: BAT-2024-000001', date: '2024-05-18 11:30:00' },
  { id: '5', action: 'PASSPORT_CREATED', actor: 'Klaus Weber', email: 'manufacturer@voltaics.de', details: 'Battery passport draft record created: SN-2024-001', date: '2024-05-17 09:15:00' },
];

export default function AuditTrailPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Registry Audit Trail</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Immutable historic logs documenting all state mutations and actions within the registry
        </p>
      </div>

      <div className="space-y-4">
        {mockLogs.map((log) => (
          <div key={log.id} className="glass-card rounded-xl p-5 border border-slate-700/40 hover:border-emerald-500/10 transition-all flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium">{log.details}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="w-3.5 h-3.5" />
                <span>{log.actor} ({log.email})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
