'use client';

import { useRouter } from 'next/navigation';
import {
  Plus,
  Upload,
  ClipboardList,
  Download,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'Create New Passport',
    description: 'Start a new battery passport',
    icon: Plus,
    href: '/passports/new',
    color: 'emerald',
    primary: true,
  },
  {
    label: 'Upload Certificate',
    description: 'Add compliance certificate',
    icon: Upload,
    href: '/certificates',
    color: 'blue',
    primary: false,
  },
  {
    label: 'Assign Task',
    description: 'Delegate review to team',
    icon: ClipboardList,
    href: '/tasks',
    color: 'violet',
    primary: false,
  },
  {
    label: 'Export Report',
    description: 'Download compliance report',
    icon: Download,
    href: '#',
    color: 'amber',
    primary: false,
  },
];

const colorClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/40',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40',
};

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-slate-200 font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group text-left',
              colorClasses[action.color]
            )}
          >
            <div className="flex-shrink-0">
              <action.icon className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
