'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { PassportFormData } from './index';
import { Plus, Trash2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepMaterialInfo() {
  const { register, control, formState: { errors } } = useFormContext<PassportFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Material Composition
        </h3>
        <button
          type="button"
          onClick={() => append({ name: '', percentage: 0, originCountry: '', supplier: '' })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-500/20 transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Material
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="p-8 rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-800/20 text-center">
          <p className="text-slate-500 text-sm">No materials added yet.</p>
          <p className="text-slate-600 text-xs mt-1">Add details of battery composition (e.g. Cobalt, Lithium, Nickel).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid">
            <div className="col-span-4">Material Name</div>
            <div className="col-span-2">Percentage (%)</div>
            <div className="col-span-3">Origin Country</div>
            <div className="col-span-2">Supplier</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 md:p-0 rounded-xl bg-slate-800/30 border border-slate-700/30 md:border-0 md:bg-transparent"
              >
                {/* Material Name */}
                <div className="col-span-4 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Material Name</label>
                  <input
                    {...register(`materials.${index}.name` as const)}
                    placeholder="e.g. Lithium"
                    className={cn(
                      'form-input',
                      errors.materials?.[index]?.name && 'border-red-500/50'
                    )}
                  />
                  {errors.materials?.[index]?.name && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.materials[index]?.name?.message}</p>
                  )}
                </div>

                {/* Percentage */}
                <div className="col-span-2 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Percentage (%)</label>
                  <input
                    {...register(`materials.${index}.percentage` as const, { valueAsNumber: true })}
                    type="number"
                    step="any"
                    placeholder="25"
                    className={cn(
                      'form-input',
                      errors.materials?.[index]?.percentage && 'border-red-500/50'
                    )}
                  />
                  {errors.materials?.[index]?.percentage && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.materials[index]?.percentage?.message}</p>
                  )}
                </div>

                {/* Origin Country */}
                <div className="col-span-3 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Origin Country</label>
                  <input
                    {...register(`materials.${index}.originCountry` as const)}
                    placeholder="e.g. Chile"
                    className={cn(
                      'form-input',
                      errors.materials?.[index]?.originCountry && 'border-red-500/50'
                    )}
                  />
                  {errors.materials?.[index]?.originCountry && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.materials[index]?.originCountry?.message}</p>
                  )}
                </div>

                {/* Supplier */}
                <div className="col-span-2 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Supplier</label>
                  <input
                    {...register(`materials.${index}.supplier` as const)}
                    placeholder="e.g. SQM"
                    className={cn(
                      'form-input',
                      errors.materials?.[index]?.supplier && 'border-red-500/50'
                    )}
                  />
                  {errors.materials?.[index]?.supplier && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.materials[index]?.supplier?.message}</p>
                  )}
                </div>

                {/* Delete Button */}
                <div className="col-span-1 flex items-center justify-end pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/20 transition-all duration-200"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
