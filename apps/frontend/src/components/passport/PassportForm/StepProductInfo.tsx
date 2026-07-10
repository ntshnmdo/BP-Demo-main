'use client';

import { useFormContext } from 'react-hook-form';
import { PassportFormData } from './index';
import { cn } from '@/lib/utils';

export function StepProductInfo() {
  const { register, formState: { errors } } = useFormContext<PassportFormData>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Model Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Model Name <span className="text-red-400 ml-1">*</span>
        </label>
        <input
          {...register('model')}
          placeholder="e.g., VoltPack Ultra 100"
          className={cn('form-input', errors.model && 'border-red-500/50')}
        />
        {errors.model && (
          <p className="text-red-400 text-xs mt-1">{errors.model.message}</p>
        )}
      </div>

      {/* Country of Origin */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Country of Origin <span className="text-red-400 ml-1">*</span>
        </label>
        <input
          {...register('countryOfOrigin')}
          placeholder="e.g., Germany, China"
          className={cn('form-input', errors.countryOfOrigin && 'border-red-500/50')}
        />
        {errors.countryOfOrigin && (
          <p className="text-red-400 text-xs mt-1">{errors.countryOfOrigin.message}</p>
        )}
      </div>

      {/* Battery Type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Battery Category <span className="text-red-400 ml-1">*</span>
        </label>
        <select
          {...register('batteryType')}
          className={cn('form-input select-input', errors.batteryType && 'border-red-500/50')}
        >
          <option value="EV">Electric Vehicle (EV)</option>
          <option value="INDUSTRIAL">Industrial</option>
          <option value="STATIONARY">Stationary Storage</option>
          <option value="CONSUMER">Consumer</option>
          <option value="MARINE">Marine</option>
        </select>
        {errors.batteryType && (
          <p className="text-red-400 text-xs mt-1">{errors.batteryType.message}</p>
        )}
      </div>

      {/* Chemistry */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Electro-chemical Chemistry <span className="text-red-400 ml-1">*</span>
        </label>
        <select
          {...register('chemistry')}
          className={cn('form-input select-input', errors.chemistry && 'border-red-500/50')}
        >
          <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
          <option value="LFP">LFP (Lithium Iron Phosphate)</option>
          <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
          <option value="LMO">LMO (Lithium Manganese Oxide)</option>
          <option value="LTO">LTO (Lithium Titanate)</option>
          <option value="SOLID_STATE">Solid State</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.chemistry && (
          <p className="text-red-400 text-xs mt-1">{errors.chemistry.message}</p>
        )}
      </div>

      {/* Production Date */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Production Date <span className="text-red-400 ml-1">*</span>
        </label>
        <input
          {...register('productionDate')}
          type="date"
          className={cn('form-input', errors.productionDate && 'border-red-500/50')}
        />
        {errors.productionDate && (
          <p className="text-red-400 text-xs mt-1">{errors.productionDate.message}</p>
        )}
      </div>

      {/* Intended Use */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Intended Use
        </label>
        <input
          {...register('intendedUse')}
          placeholder="e.g., Light Passenger Vehicle"
          className="form-input"
        />
      </div>

      {/* Capacity (kWh) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Nominal Capacity (kWh)
        </label>
        <input
          {...register('capacityKwh', { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="e.g., 75"
          className={cn('form-input', errors.capacityKwh && 'border-red-500/50')}
        />
        {errors.capacityKwh && (
          <p className="text-red-400 text-xs mt-1">{errors.capacityKwh.message}</p>
        )}
      </div>

      {/* Nominal Voltage (V) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Nominal Voltage (V)
        </label>
        <input
          {...register('nominalVoltageV', { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="e.g., 400"
          className={cn('form-input', errors.nominalVoltageV && 'border-red-500/50')}
        />
        {errors.nominalVoltageV && (
          <p className="text-red-400 text-xs mt-1">{errors.nominalVoltageV.message}</p>
        )}
      </div>

      {/* State of Health (SOH) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          State of Health (SoH %)
        </label>
        <input
          {...register('stateOfHealth', { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="e.g., 96"
          className={cn('form-input', errors.stateOfHealth && 'border-red-500/50')}
        />
        {errors.stateOfHealth && (
          <p className="text-red-400 text-xs mt-1">{errors.stateOfHealth.message}</p>
        )}
      </div>

      {/* State of Charge (SOC) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          State of Charge (SoC %)
        </label>
        <input
          {...register('stateOfCharge', { valueAsNumber: true })}
          type="number"
          step="any"
          placeholder="e.g., 78"
          className={cn('form-input', errors.stateOfCharge && 'border-red-500/50')}
        />
        {errors.stateOfCharge && (
          <p className="text-red-400 text-xs mt-1">{errors.stateOfCharge.message}</p>
        )}
      </div>
    </div>
  );
}
