import { cn } from '@/lib/utils';
import { PassportStatus } from '@/lib/api/passports';
import { FileText, Send, CheckCircle, Globe, XCircle, Circle } from 'lucide-react';

interface PassportStatusBadgeProps {
  status: PassportStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    classes: string;
    dotColor: string;
    icon: React.ElementType;
  }
> = {
  DRAFT: {
    label: 'Draft',
    classes: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    dotColor: 'bg-slate-400',
    icon: FileText,
  },
  SUBMITTED: {
    label: 'Submitted',
    classes: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    dotColor: 'bg-blue-400',
    icon: Send,
  },
  APPROVED: {
    label: 'Approved',
    classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    icon: CheckCircle,
  },
  PUBLISHED: {
    label: 'Published',
    classes: 'bg-green-500/15 text-green-300 border-green-500/30',
    dotColor: 'bg-green-400',
    icon: Globe,
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-500/10 text-red-300 border-red-500/30',
    dotColor: 'bg-red-400',
    icon: XCircle,
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

export function PassportStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: PassportStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    dotColor: 'bg-slate-400',
    icon: Circle,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wider',
        config.classes,
        SIZE_CLASSES[size]
      )}
    >
      {showIcon ? (
        <Icon className={cn('flex-shrink-0', size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
      ) : (
        <span className={cn('rounded-full flex-shrink-0', config.dotColor, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      )}
      {config.label}
    </span>
  );
}
