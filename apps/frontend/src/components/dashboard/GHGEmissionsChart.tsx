'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGhgEmissions } from '@/lib/hooks/useDashboard';

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ name: string; value: number; color: string }>;
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-slate-700/50 shadow-xl">
      <p className="font-semibold text-slate-200 mb-1.5 truncate max-w-[160px]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium text-slate-200">{entry.value.toFixed(1)} kg CO₂e</span>
        </div>
      ))}
    </div>
  );
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>;
}

const LEGEND_LABELS: Record<string, string> = {
  carbonFootprint: 'Carbon Footprint',
  ghgEmissions: 'GHG Emissions',
  manufacturingSiteEmissions: 'Mfg. Site Emissions',
};

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 text-xs">{LEGEND_LABELS[entry.value] || entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function GHGEmissionsChart() {
  const { data, isLoading } = useGhgEmissions();

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5">
        <div className="skeleton h-4 w-48 rounded mb-6" />
        <div className="skeleton w-full h-52 rounded" />
      </div>
    );
  }

  // Shorten names for axis labels
  const chartData = (data ?? []).map((d) => ({
    ...d,
    shortName: d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name,
  }));

  const totalCO2 = (data ?? []).reduce((sum, d) => sum + d.carbonFootprint, 0);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-200 font-semibold">GHG Emissions (CO₂e)</h3>
          <p className="text-slate-500 text-xs mt-0.5">Carbon footprint per battery passport</p>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 text-sm font-semibold">
            {totalCO2.toFixed(1)}
          </span>
          <p className="text-slate-500 text-xs">kg CO₂e total</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={248}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
          barSize={7}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis
            dataKey="shortName"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            unit=" kg"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="carbonFootprint" name="carbonFootprint" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="ghgEmissions" name="ghgEmissions" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar
            dataKey="manufacturingSiteEmissions"
            name="manufacturingSiteEmissions"
            fill="#f59e0b"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
