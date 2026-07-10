'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { Settings, User, Building, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Manage your account profile, organizational details, and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User profile card */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-slate-700/40 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            User Account Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs font-semibold">Full Name</p>
              <p className="text-slate-200 mt-1 font-semibold">{user?.name || 'Jane Doe'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold">Email Address</p>
              <p className="text-slate-200 mt-1 font-semibold">{user?.email || 'jane@example.com'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold">Access Level Role</p>
              <p className="text-emerald-400 mt-1 font-semibold font-mono">{user?.role || 'MANUFACTURER'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-semibold">Associated Organization</p>
              <p className="text-slate-200 mt-1 font-semibold">{user?.organizationName || 'Your Organization'}</p>
            </div>
          </div>
        </div>

        {/* Security / Registry Info */}
        <div className="lg:col-span-1 glass-card rounded-xl p-6 border border-slate-700/40 space-y-4">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            System Status
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Registry System</span>
              <span className="text-emerald-400 font-semibold">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Connection</span>
              <span className="text-emerald-400 font-semibold font-mono">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Blockchain Sync</span>
              <span className="text-emerald-400 font-semibold font-mono">Active (Mock)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
