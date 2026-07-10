'use client';

import { useFormContext } from 'react-hook-form';
import { PassportFormData } from './index';
import { formatDate } from '@/lib/utils';
import {
  Fingerprint,
  Package,
  Layers,
  Leaf,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function StepReview() {
  const { watch } = useFormContext<PassportFormData>();
  const data = watch();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Please review all input fields below. Once created, the record will start in the <span className="text-slate-200 font-semibold">DRAFT</span> status.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1 & 2: Identification & Product Info */}
        <div className="glass-card rounded-xl p-5 border border-slate-700/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-slate-800 pb-2">
            <Fingerprint className="w-4 h-4" />
            Identification & Specifications
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Passport ID</p>
              <p className="text-slate-200 font-mono mt-0.5">{data.passportId}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Serial Number</p>
              <p className="text-slate-200 font-mono mt-0.5">{data.serialNumber}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Model</p>
              <p className="text-slate-200 mt-0.5">{data.model}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Category</p>
              <p className="text-slate-200 mt-0.5">{data.batteryType}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Chemistry</p>
              <p className="text-slate-200 mt-0.5">{data.chemistry}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Origin</p>
              <p className="text-slate-200 mt-0.5">{data.countryOfOrigin}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Production Date</p>
              <p className="text-slate-200 mt-0.5">
                {data.productionDate ? new Date(data.productionDate).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Nominal Volt/Cap</p>
              <p className="text-slate-200 mt-0.5">
                {data.nominalVoltageV ? `${data.nominalVoltageV}V` : '—'} / {data.capacityKwh ? `${data.capacityKwh}kWh` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Material Composition */}
        <div className="glass-card rounded-xl p-5 border border-slate-700/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4" />
            Material Composition
          </div>
          {data.materials && data.materials.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {data.materials.map((m, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-slate-850">
                  <div>
                    <span className="font-semibold text-slate-200">{m.name}</span>
                    <span className="text-slate-500 ml-1.5 font-mono">({m.supplier})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold font-mono">{m.percentage}%</span>
                    <span className="text-slate-500 ml-1.5 font-mono">{m.originCountry}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">No materials declared.</p>
          )}
        </div>

        {/* Step 4: Carbon Info */}
        <div className="glass-card rounded-xl p-5 border border-slate-700/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-slate-800 pb-2">
            <Leaf className="w-4 h-4" />
            Carbon Footprint & Emissions
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Footprint</p>
              <p className="text-emerald-400 font-bold font-mono mt-0.5">
                {data.carbonFootprintKgCo2eKwh ? `${data.carbonFootprintKgCo2eKwh} kg/kWh` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">GHG Emissions</p>
              <p className="text-emerald-400 font-bold font-mono mt-0.5">
                {data.ghgEmissions ? `${data.ghgEmissions} t` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Site Emissions</p>
              <p className="text-emerald-400 font-bold font-mono mt-0.5">
                {data.manufacturingSiteEmissions ? `${data.manufacturingSiteEmissions} t` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 5 & 6: Compliance & Circularity */}
        <div className="glass-card rounded-xl p-5 border border-slate-700/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4" />
            Compliance & Circularity
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Recycled Content</p>
              <p className="text-slate-200 mt-0.5">{data.recycledContentPercent ? `${data.recycledContentPercent}%` : '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Circularity Score</p>
              <p className="text-emerald-400 font-bold mt-0.5">{data.circularityScore ? `${data.circularityScore}/100` : '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Warranty Km</p>
              <p className="text-slate-200 font-mono mt-0.5">
                {data.warrantyKm ? `${data.warrantyKm.toLocaleString()} km` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Certificates Listed</p>
              <p className="text-slate-200 mt-0.5">{data.certificates?.length ?? 0} certs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
