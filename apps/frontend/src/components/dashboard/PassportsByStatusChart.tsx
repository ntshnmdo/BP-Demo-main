'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStatusDistribution } from '@/lib/hooks/useDashboard';

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: '#10b981',
  APPROVED: '#34d399',
  SUBMITTED: '#60a5fa',
  DRAFT: '#64748b',
  REJECTED: '#f87171',
};

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Published',
  APPROVED: 'Approved',
  SUBMITTED: 'Submitted',
  DRAFT: 'Draft',
  REJECTED: 'Rejected',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { status: string; count: number; percentage: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-200">{STATUS_LABELS[item.status] || item.status}</p>
      <p className="text-slate-400">
        {item.count} passport{item.count !== 1 ? 's' : ''} ({item.percentage}%)
      </p>
    </div>
  );
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 text-xs">{STATUS_LABELS[entry.value] || entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function CenterLabel({ total }: { total: number }) {
  return (
    <g>
      <text
        x="50%"
        y="45%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-100 text-3xl font-bold"
        style={{ fontSize: '28px', fontWeight: 700, fill: '#f1f5f9' }}
      >
        {total}
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: '12px', fill: '#64748b' }}
      >
        Total
      </text>
    </g>
  );
}

export function PassportsByStatusChart() {
  const { data, isLoading } = useStatusDistribution();

  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const chartData =
    data?.map((d) => ({
      ...d,
      name: d.status,
      color: STATUS_COLORS[d.status] ?? '#64748b',
    })) ?? [];

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="skeleton h-4 w-40 rounded mb-6" />
        <div className="skeleton w-48 h-48 rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-200 font-semibold">Passports by Status</h3>
        <span className="text-slate-500 text-xs bg-slate-800/50 px-2.5 py-1 rounded-full">
          {total} total
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="count"
            nameKey="status"
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <CenterLabel total={total} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
