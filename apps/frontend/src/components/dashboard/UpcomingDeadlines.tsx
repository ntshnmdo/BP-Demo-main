'use client';

import Link from 'next/link';
import { useUpcomingTasks } from '@/lib/hooks/useDashboard';
import { formatDate } from '@/lib/utils';
import { Clock, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_CONFIG = {
  HIGH: {
    label: 'Overdue / Urgent',
    dot: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: AlertTriangle,
  },
  MEDIUM: {
    label: 'Due Soon',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Clock,
  },
  LOW: {
    label: 'Upcoming',
    dot: 'bg-slate-500',
    badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: Calendar,
  },
};

const TASK_LABELS: Record<string, string> = {
  APPROVAL_DEADLINE: 'Approval Deadline',
  CERTIFICATE_EXPIRY: 'Certificate Expiry',
  RENEWAL: 'Renewal Due',
  REVIEW: 'Review Required',
};

export function UpcomingDeadlines() {
  const { data: tasks, isLoading } = useUpcomingTasks();

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-200 font-semibold">Upcoming Deadlines</h3>
        <Link
          href="/tasks"
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
        >
          View tasks <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/20">
                <div className="skeleton h-3.5 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))
          : tasks?.map((task) => {
              const config = PRIORITY_CONFIG[task.priority];
              const Icon = config.icon;

              return (
                <Link
                  key={task.id}
                  href={`/passports/${task.passportId}`}
                  className="block p-3 rounded-lg bg-slate-800/30 border border-slate-700/20 hover:border-slate-600/30 hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', config.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {task.model}
                        </p>
                        <span
                          className={cn(
                            'flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                            config.badge
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {task.daysUntilDue === 0
                            ? 'Today'
                            : task.daysUntilDue < 0
                            ? `${Math.abs(task.daysUntilDue)}d overdue`
                            : `${task.daysUntilDue}d left`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 text-xs">
                          {task.passportDisplayId}
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-500 text-xs">
                          {TASK_LABELS[task.taskType] || task.taskType}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>

      {!isLoading && (!tasks || tasks.length === 0) && (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No upcoming deadlines</p>
        </div>
      )}
    </div>
  );
}
