'use client';

import { useUpcomingTasks } from '@/lib/hooks/useDashboard';
import { useAuthStore } from '@/lib/store/authStore';
import { CheckSquare, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  const { user } = useAuthStore();
  const { data: tasksData, isLoading } = useUpcomingTasks();
  const tasks = tasksData ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tasks & Approvals</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Review battery passports pending action or regulatory checks
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/10">
          <CheckSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-200">No Pending Tasks</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Great! All battery passports are currently up to date. No actions are required at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="glass-card rounded-xl p-5 border border-slate-700/40 hover:border-emerald-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{task.model}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Passport ID: {task.passportId} · Serial: {task.serialNumber}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: {task.status} · Last updated: {new Date(task.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Link
                href={`/passports/${task.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg self-end md:self-auto transition-all"
              >
                Go to Approval
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
