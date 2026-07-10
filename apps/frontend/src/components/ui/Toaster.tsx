'use client';

import { useToastStore } from '@/lib/store/toastStore';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => {
        const Icon = {
          success: CheckCircle,
          error: XCircle,
          warning: AlertCircle,
          info: Info,
        }[t.type];

        const colors = {
          success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300',
          error: 'bg-red-950/90 border-red-500/30 text-red-300',
          warning: 'bg-amber-950/90 border-amber-500/30 text-amber-300',
          info: 'bg-slate-900/90 border-slate-700/50 text-slate-300',
        }[t.type];

        const iconColor = {
          success: 'text-emerald-400',
          error: 'text-red-400',
          warning: 'text-amber-400',
          info: 'text-blue-400',
        }[t.type];

        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border backdrop-blur shadow-2xl transition-all duration-300 animate-slide-up',
              colors
            )}
          >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded-md hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
