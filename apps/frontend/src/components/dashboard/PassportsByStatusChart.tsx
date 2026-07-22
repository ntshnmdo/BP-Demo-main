'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePassports } from '@/lib/hooks/usePassports';

function calculateGHGAvoided(p: any): number {
  // Baseline carbon footprint of standard manufacturing = 95 kg CO2e / kWh
  const baseline = 95;
  const actualFootprint = p.carbonFootprintKgCo2eKwh ?? p.carbonFootprint ?? 70;
  const capacity = p.capacityKwh ?? p.capacity ?? 60;
  const avoidedKg = Math.max(0, (baseline - actualFootprint) * capacity);
  return avoidedKg / 1000; // in tonnes CO2e
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs border border-emerald-500/20 bg-slate-900/90 shadow-xl">
      <p className="font-semibold text-slate-200">{data.fullModelName}</p>
      <p className="text-emerald-400 font-medium mt-1">
        {data.avoided.toFixed(2)} t CO2e avoided
      </p>
    </div>
  );
}

export function PassportsByStatusChart() {
  const { data: response, isLoading } = usePassports({ limit: 100 });
  const passports = response?.data || [];

  // Group emissions avoided by model
  const modelAvoided: Record<string, number> = {};
  passports.forEach((p) => {
    const avoided = calculateGHGAvoided(p);
    const model = p.model || 'Unknown Model';
    modelAvoided[model] = (modelAvoided[model] || 0) + avoided;
  });

  const chartData = Object.entries(modelAvoided)
    .map(([model, avoided]) => ({
      model: model.length > 15 ? `${model.slice(0, 13)}...` : model,
      fullModelName: model,
      avoided: Number(avoided.toFixed(2)),
    }))
    .sort((a, b) => b.avoided - a.avoided)
    .slice(0, 5); // Show top 5 models

  const grandTotal = Object.values(modelAvoided).reduce((sum, val) => sum + val, 0);

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-5 border border-slate-800/40 bg-slate-950/40">
        <div className="skeleton h-4 w-40 rounded mb-6 animate-pulse bg-slate-800" />
        <div className="skeleton w-full h-[240px] rounded mx-auto animate-pulse bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800/40 bg-slate-950/40 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-slate-200 font-semibold text-sm">GHG Emissions Avoided</h3>
          <p className="text-slate-500 text-xs mt-0.5">CO₂e saved vs baseline (95 kg/kWh)</p>
        </div>
        <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
          {grandTotal.toFixed(1)} t CO₂e total
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[240px] flex items-center justify-center text-slate-500 text-xs">
          No emission savings recorded
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 15, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorAvoided" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              unit=" t"
            />
            <YAxis
              dataKey="model"
              type="category"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey="avoided"
              fill="url(#colorAvoided)"
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
