'use client';

import { cn } from '@/lib/utils';
import { Factory, Truck, Wrench, BatteryCharging, RefreshCw } from 'lucide-react';

interface LifecycleEvent {
  stage: 'MANUFACTURED' | 'SHIPPED' | 'INSTALLED' | 'IN_SERVICE' | 'END_OF_LIFE';
  date?: string;
  location?: string;
}

interface BatteryLifecycleProps {
  events?: LifecycleEvent[];
  currentStage?: 'MANUFACTURED' | 'SHIPPED' | 'INSTALLED' | 'IN_SERVICE' | 'END_OF_LIFE';
}

const STAGES = [
  { key: 'MANUFACTURED', label: 'Manufactured', icon: Factory, desc: 'Production phase complete' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'Transport and logistics' },
  { key: 'INSTALLED', label: 'Installed', icon: Wrench, desc: 'Commissioning & integration' },
  { key: 'IN_SERVICE', label: 'In Service', icon: BatteryCharging, desc: 'Active operation phase' },
  { key: 'END_OF_LIFE', label: 'End of Life', icon: RefreshCw, desc: 'Decommissioned & recycled' },
];

export default function BatteryLifecycle({ events = [], currentStage = 'IN_SERVICE' }: BatteryLifecycleProps) {
  const getEventForStage = (stageKey: string) => {
    return events.find((e) => e.stage === stageKey);
  };

  const getStageIndex = (stageKey: string) => {
    return STAGES.findIndex((s) => s.key === stageKey);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="relative py-4">
      {/* Connector Line */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-0.5 bg-slate-800 -z-10 hidden md:block">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
        {STAGES.map((stage, idx) => {
          const StageIcon = stage.icon;
          const isCompleted = currentIndex > idx;
          const isActive = currentIndex === idx;
          const isFuture = currentIndex < idx;
          const event = getEventForStage(stage.key);

          return (
            <div
              key={stage.key}
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
                  isActive && 'bg-slate-900 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/10 animate-pulse',
                  isFuture && 'bg-slate-900 border-slate-700 text-slate-500'
                )}
              >
                <StageIcon className="w-4 h-4" />
              </div>

              {/* Text info */}
              <div className="space-y-0.5">
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    isActive && 'text-emerald-400',
                    isCompleted && 'text-slate-200',
                    isFuture && 'text-slate-500'
                  )}
                >
                  {stage.label}
                </h4>
                <p className="text-xs text-slate-500">{stage.desc}</p>
                {event?.date && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                )}
                {event?.location && (
                  <p className="text-[9px] text-slate-500 mt-0.5">{event.location}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
