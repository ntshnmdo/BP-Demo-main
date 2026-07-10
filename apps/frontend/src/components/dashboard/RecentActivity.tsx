'use client';

import Link from 'next/link';
import { useRecentActivity } from '@/lib/hooks/useDashboard';
import { formatRelativeTime } from '@/lib/utils';
import {
  FileCheck,
  FilePlus,
  FileX,
  FileSearch,
  Send,
  Globe,
  Activity,
} from 'lucide-react';

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  PASSPORT_CREATED: {
    label: 'created passport',
    icon: FilePlus,
    color: 'text-slate-400 bg-slate-800/50',
  },
  PASSPORT_SUBMITTED: {
    label: 'submitted for review',
    icon: Send,
    color: 'text-blue-400 bg-blue-500/10',
  },
  PASSPORT_APPROVED: {
    label: 'approved passport',
    icon: FileCheck,
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  PASSPORT_REJECTED: {
    label: 'rejected passport',
    icon: FileX,
    color: 'text-red-400 bg-red-500/10',
  },
  PASSPORT_PUBLISHED: {
    label: 'published passport',
    icon: Globe,
    color: 'text-green-400 bg-green-500/10',
  },
  PASSPORT_REVIEWED: {
    label: 'reviewed passport',
    icon: FileSearch,
    color: 'text-amber-400 bg-amber-500/10',
  },
};

export function RecentActivity() {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-slate-200 font-semibold">Recent Activity</h3>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))
          : activities?.map((activity) => {
              const config =
                ACTION_CONFIG[activity.action] || {
                  label: activity.action.toLowerCase().replace(/_/g, ' '),
                  icon: Activity,
                  color: 'text-slate-400 bg-slate-800/50',
                };
              const Icon = config.icon;

              return (
                <div key={activity.id} className="flex items-start gap-3 group">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 leading-snug">
                      <span className="font-medium text-slate-200">{activity.actorName}</span>{' '}
                      <span className="text-slate-400">{config.label}</span>{' '}
                      <Link
                        href={`/passports/${activity.passportId}`}
                        className="font-mono text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
                      >
                        {activity.passportDisplayId}
                      </Link>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-600 text-xs">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-slate-600 text-xs">{activity.actorRole}</span>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {!isLoading && (!activities || activities.length === 0) && (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
}
