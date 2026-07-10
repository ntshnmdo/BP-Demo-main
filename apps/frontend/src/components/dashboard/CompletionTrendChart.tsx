'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useCompletionTrend } from '@/lib/hooks/useDashboard';
import { TrendingUp } from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg p-3 text-xs border border-slate-700/30">
      <p className="font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400 capitalize">{entry.name}</span>
          </div>
          <span className="font-semibold text-slate-200">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function CompletionTrendChart() {
  const { data, isLoading } = useCompletionTrend();

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="skeleton h-4 w-48 rounded mb-6" />
        <div className="skeleton w-full h-48 rounded" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-slate-200 font-semibold">Completion Trend</h3>
          <p className="text-slate-500 text-xs mt-0.5">Last 6 months · Passports created & published</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 text-xs font-semibold">+23%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="publishedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(71,85,105,0.2)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'capitalize' }}>
                {value}
              </span>
            )}
            iconType="circle"
            iconSize={6}
          />
          <Area
            type="monotone"
            dataKey="created"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#createdGradient)"
            dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
          />
          <Area
            type="monotone"
            dataKey="published"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#publishedGradient)"
            dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#60a5fa' }}
          />
          <Area
            type="monotone"
            dataKey="approved"
            stroke="#a78bfa"
            strokeWidth={2}
            fill="url(#approvedGradient)"
            dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: '#a78bfa' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
