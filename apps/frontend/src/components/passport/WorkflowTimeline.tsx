'use client';

import { cn } from '@/lib/utils';
import { Check, ClipboardList, Send, ShieldCheck, Globe } from 'lucide-react';
import { PassportStatus } from '@/lib/api/passports';

interface WorkflowTimelineProps {
  status: PassportStatus;
  submittedAt?: string | Date;
  approvedAt?: string | Date;
  publishedAt?: string | Date;
}

const STEPS = [
  { status: 'DRAFT', label: 'Draft', icon: ClipboardList, desc: 'Created & Editing' },
  { status: 'SUBMITTED', label: 'Submitted', icon: Send, desc: 'Awaiting Approval' },
  { status: 'APPROVED', label: 'Approved', icon: ShieldCheck, desc: 'Regulatory Approved' },
  { status: 'PUBLISHED', label: 'Published', icon: Globe, desc: 'Publicly Registered' },
];

export default function WorkflowTimeline({
  status,
  submittedAt,
  approvedAt,
  publishedAt,
}: WorkflowTimelineProps) {
  const getStepIndex = (s: string) => {
    switch (s) {
      case 'DRAFT': return 0;
      case 'SUBMITTED': return 1;
      case 'APPROVED': return 2;
      case 'PUBLISHED': return 3;
      case 'REJECTED': return 1; // Rejected shows at Submitted stage
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(status);

  const getStepDate = (stepStatus: string) => {
    if (stepStatus === 'SUBMITTED' && submittedAt) return new Date(submittedAt).toLocaleDateString();
    if (stepStatus === 'APPROVED' && approvedAt) return new Date(approvedAt).toLocaleDateString();
    if (stepStatus === 'PUBLISHED' && publishedAt) return new Date(publishedAt).toLocaleDateString();
    return null;
  };

  return (
    <div className="relative py-4">
      {/* Connector Line */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-0.5 bg-slate-700 -z-10 hidden md:block">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${(currentStepIndex / 3) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = currentStepIndex > idx;
          const isActive = currentStepIndex === idx;
          const isFuture = currentStepIndex < idx;
          const stepDate = getStepDate(step.status);
          const isRejectedStep = status === 'REJECTED' && step.status === 'SUBMITTED';

          return (
            <div
              key={step.status}
              className={cn(
                'flex md:flex-col items-center md:text-center gap-4 md:gap-2.5 transition-all duration-200',
                isFuture && 'opacity-40'
              )}
            >
              {/* Icon Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 flex-shrink-0 transition-all duration-300',
                  isCompleted && 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20',
                  isActive && !isRejectedStep && 'bg-slate-900 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/10',
                  isRejectedStep && 'bg-red-500/10 border-red-500 text-red-500 ring-4 ring-red-500/10',
                  isFuture && 'bg-slate-900 border-slate-700 text-slate-500'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>

              {/* Text */}
              <div className="space-y-0.5">
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    isActive && !isRejectedStep && 'text-emerald-400',
                    isRejectedStep && 'text-red-400',
                    isCompleted && 'text-slate-200',
                    isFuture && 'text-slate-500'
                  )}
                >
                  {isRejectedStep ? 'Rejected' : step.label}
                </h4>
                <p className="text-xs text-slate-500">{step.desc}</p>
                {stepDate && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{stepDate}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
