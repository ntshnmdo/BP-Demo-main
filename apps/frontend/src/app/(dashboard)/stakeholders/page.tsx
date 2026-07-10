'use client';

import { Users, Building, ShieldCheck, Mail } from 'lucide-react';

const mockStakeholders = [
  { name: 'System Administrator', email: 'admin@batterypassport.eu', role: 'ADMIN', org: 'Battery Passport Registry' },
  { name: 'Klaus Weber', email: 'manufacturer@voltaics.de', role: 'MANUFACTURER', org: 'Voltaics GmbH' },
  { name: 'Sophie van der Berg', email: 'ops@ecopower.nl', role: 'MANUFACTURER', org: 'EcoPower Solutions' },
  { name: 'Dr. Ingrid Müller', email: 'lab@tuv-testing.de', role: 'TESTING_LABORATORY', org: 'TÜV Testing Laboratory' },
  { name: 'Marco Rossi', email: 'sustainability@greenchain.eu', role: 'SUSTAINABILITY_TEAM', org: 'GreenChain EU' },
  { name: 'Wei Zhang', email: 'supply@lithiumsource.cn', role: 'MATERIAL_SUPPLIER', org: 'LithiumSource Resources' },
];

export default function StakeholdersPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Registered Stakeholders</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage system users and role permissions across organizations in the Battery Passport Registry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockStakeholders.map((sh, idx) => (
          <div key={idx} className="glass-card rounded-xl p-5 border border-slate-700/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                {sh.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{sh.name}</h4>
                <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <Building className="w-3 h-3" />
                  {sh.org}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {sh.email}
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Role: <span className="text-emerald-400 font-semibold">{sh.role}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
