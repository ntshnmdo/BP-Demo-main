'use client';

import { useState, useEffect, useRef } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'slate' | 'violet';
  suffix?: string;
  prefix?: string;
  loading?: boolean;
}

function useAnimatedCounter(target: number, duration = 1000, enabled = true) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return count;
}

const colorConfig = {
  emerald: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconText: 'text-emerald-400',
    glow: 'hover:border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-400',
  },
  blue: {
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconText: 'text-blue-400',
    glow: 'hover:border-blue-500/30',
    badge: 'bg-blue-500/10 text-blue-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconText: 'text-amber-400',
    glow: 'hover:border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-400',
  },
  red: {
    iconBg: 'bg-red-500/10 border-red-500/20',
    iconText: 'text-red-400',
    glow: 'hover:border-red-500/30',
    badge: 'bg-red-500/10 text-red-400',
  },
  slate: {
    iconBg: 'bg-slate-500/10 border-slate-500/20',
    iconText: 'text-slate-400',
    glow: 'hover:border-slate-500/30',
    badge: 'bg-slate-500/10 text-slate-400',
  },
  violet: {
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    iconText: 'text-violet-400',
    glow: 'hover:border-violet-500/30',
    badge: 'bg-violet-500/10 text-violet-400',
  },
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'emerald',
  suffix,
  prefix,
  loading = false,
}: StatsCardProps) {
  const colors = colorConfig[color];
  const animatedValue = useAnimatedCounter(value, 1200, !loading);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton w-10 h-10 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-20 rounded mb-2" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 transition-all duration-200 cursor-default group',
        colors.glow
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div
          className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-5 h-5', colors.iconText)} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-slate-100 tabular-nums tracking-tight">
          {prefix}{animatedValue.toLocaleString()}{suffix}
        </span>
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
              isPositive && 'bg-emerald-500/10 text-emerald-400',
              isNegative && 'bg-red-500/10 text-red-400',
              isNeutral && 'bg-slate-500/10 text-slate-400'
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            {isPositive && '+'}
            {Math.abs(change)}%
          </div>
          <span className="text-slate-600 text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
}
