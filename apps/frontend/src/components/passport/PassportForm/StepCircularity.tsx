'use client';

import { useFormContext } from 'react-hook-form';
import { PassportFormData } from './index';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export function StepCircularity() {
  const { register, watch, formState: { errors } } = useFormContext<PassportFormData>();

  const score = watch('circularityScore') || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recycled Content */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Recycled Content (%)
          </label>
          <input
            {...register('recycledContentPercent', { valueAsNumber: true })}
            type="number"
            step="any"
            placeholder="e.g. 25"
            className={cn(
              'form-input',
              errors.recycledContentPercent && 'border-red-500/50'
            )}
          />
          {errors.recycledContentPercent && (
            <p className="text-red-400 text-xs mt-1">{errors.recycledContentPercent.message}</p>
          )}
          <p className="text-slate-500 text-xs mt-1">
            Percentage of active materials recovered from secondary sources
          </p>
        </div>

        {/* Circularity Score */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Circularity Score (0 - 100)
          </label>
          <input
            {...register('circularityScore', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 82"
            className={cn(
              'form-input',
              errors.circularityScore && 'border-red-500/50'
            )}
          />
          {errors.circularityScore && (
            <p className="text-red-400 text-xs mt-1">{errors.circularityScore.message}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <span className="text-xs text-emerald-400 font-semibold font-mono">{score}/100</span>
          </div>
        </div>

        {/* Warranty Start */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Warranty Start Date
          </label>
          <input
            {...register('warrantyStartDate')}
            type="date"
            className="form-input"
          />
        </div>

        {/* Warranty End */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Warranty End Date
          </label>
          <input
            {...register('warrantyEndDate')}
            type="date"
            className="form-input"
          />
        </div>

        {/* Warranty Kilometers */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Warranty Kilometers
          </label>
          <input
            {...register('warrantyKm', { valueAsNumber: true })}
            type="number"
            placeholder="e.g. 160000"
            className={cn('form-input', errors.warrantyKm && 'border-red-500/50')}
          />
          {errors.warrantyKm && (
            <p className="text-red-400 text-xs mt-1">{errors.warrantyKm.message}</p>
          )}
        </div>
      </div>

      {/* Recycling Info */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Dismantling & Recycling Information
        </label>
        <textarea
          {...register('recyclingInformation')}
          rows={3}
          placeholder="Enter detailed instructions on safe battery cell extraction, recycling channels, and material recovery guidelines..."
          className="form-input py-2"
        />
      </div>
    </div>
  );
}
