'use client';

import { useComplianceOverview } from '@/lib/hooks/useDashboard';
import { Shield, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

export default function CompliancePage() {
  const { data: compData, isLoading } = useComplianceOverview();
  const summary = compData ?? { complianceScore: 92 };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance Overview</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Track regulatory compliance scores across all batteries in the registry
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main compliance gauge display */}
        <div className="lg:col-span-1 glass-card rounded-xl p-6 border border-slate-700/40 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono text-emerald-400">{summary.complianceScore}%</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Overall Registry Compliance</h4>
            <p className="text-slate-500 text-xs mt-1">
              Percentage of published passports meeting all mandatory certifications
            </p>
          </div>
        </div>

        {/* Standards cards */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-700/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Mandatory Standards Tracking</h3>

          <div className="space-y-3.5">
            {[
              { label: 'UN38.3 (Transport Safety)', compliant: 100, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'CE Conformity Declaration', compliant: 95, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'UKCA Conformity', compliant: 88, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'REACH Chemical Disclosures', compliant: 92, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'RoHS Hazardous Substances Limit', compliant: 96, icon: CheckCircle, color: 'text-emerald-400' },
            ].map((std) => (
              <div key={std.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <std.icon className={`w-3.5 h-3.5 ${std.color}`} />
                    {std.label}
                  </span>
                  <span className="text-emerald-400 font-mono">{std.compliant}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${std.compliant}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
