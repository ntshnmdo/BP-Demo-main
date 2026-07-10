'use client';

import { useFormContext } from 'react-hook-form';
import { PassportFormData } from './index';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';

export function StepCarbonInfo() {
  const { register, watch, formState: { errors } } = useFormContext<PassportFormData>();

  const carbon = watch('carbonFootprintKgCo2eKwh') || 0;
  const ghg = watch('ghgEmissions') || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Input Columns */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Carbon Footprint (kg CO₂e/kWh)
          </label>
          <input
            {...register('carbonFootprintKgCo2eKwh', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="e.g. 62"
            className={cn(
              'form-input',
              errors.carbonFootprintKgCo2eKwh && 'border-red-500/50'
            )}
          />
          {errors.carbonFootprintKgCo2eKwh && (
            <p className="text-red-400 text-xs mt-1">{errors.carbonFootprintKgCo2eKwh.message}</p>
          )}
          <p className="text-slate-500 text-xs mt-1">
            Total lifecycle carbon footprint per unit of battery capacity
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Annual GHG Emissions (tCO₂e)
          </label>
          <input
            {...register('ghgEmissions', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="e.g. 120"
            className={cn(
              'form-input',
              errors.ghgEmissions && 'border-red-500/50'
            )}
          />
          {errors.ghgEmissions && (
            <p className="text-red-400 text-xs mt-1">{errors.ghgEmissions.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Manufacturing Facility Site Emissions (tCO₂e)
          </label>
          <input
            {...register('manufacturingSiteEmissions', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="e.g. 85"
            className={cn(
              'form-input',
              errors.manufacturingSiteEmissions && 'border-red-500/50'
            )}
          />
          {errors.manufacturingSiteEmissions && (
            <p className="text-red-400 text-xs mt-1">{errors.manufacturingSiteEmissions.message}</p>
          )}
        </div>
      </div>

      {/* Visual Indicator card */}
      <div className="flex flex-col justify-center">
        <div className="glass-card rounded-xl p-6 border border-slate-700/50 bg-slate-800/10 flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/25">
            <Leaf className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-slate-200 text-sm font-semibold">Decarbonization Impact</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">
              Based on the European Union Battery Regulations, disclosing product carbon footprint is mandatory for commercialized batteries.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Intensity</p>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{carbon} kg</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">GHG Total</p>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{ghg} t</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
