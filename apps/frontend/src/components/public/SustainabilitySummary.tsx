'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Leaf, RefreshCw, Activity } from 'lucide-react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
}

function GaugeCard({ value, max, label, sublabel, icon: Icon, color }: GaugeProps) {
  const percentage = (value / max) * 100;
  const chartData = [
    {
      name: 'value',
      value: value,
      fill: color,
    },
    {
      name: 'max',
      value: max - value,
      fill: '#1e293b', // slate-800
    },
  ];

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-700/30 flex flex-col items-center text-center space-y-4">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 text-slate-400 mb-0.5" />
          <span className="text-xl font-bold font-mono text-slate-100">{value}</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{sublabel}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-300">{label}</h4>
      </div>
    </div>
  );
}

interface SustainabilitySummaryProps {
  carbonFootprint?: number;
  recycledContent?: number;
  circularityScore?: number;
}

export default function SustainabilitySummary({
  carbonFootprint = 0,
  recycledContent = 0,
  circularityScore = 0,
}: SustainabilitySummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <GaugeCard
        label="Carbon Footprint"
        sublabel="kg CO2e/kWh"
        value={carbonFootprint}
        max={150}
        icon={Leaf}
        color="#10b981" // emerald-500
      />
      <GaugeCard
        label="Recycled Content"
        sublabel="Percent"
        value={recycledContent}
        max={100}
        icon={RefreshCw}
        color="#3b82f6" // blue-500
      />
      <GaugeCard
        label="Circularity Score"
        sublabel="Score / 100"
        value={circularityScore}
        max={100}
        icon={Activity}
        color="#8b5cf6" // violet-500
      />
    </div>
  );
}
