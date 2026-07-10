'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { PassportFormData } from './index';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepCompliance() {
  const { register, control, formState: { errors } } = useFormContext<PassportFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certificates',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Regulatory Certificates & Safety Standards
        </h3>
        <button
          type="button"
          onClick={() => append({ type: 'UN38.3', issuer: '', issueDate: '', expiryDate: '', status: 'VALID' })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-500/20 transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certificate
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="p-8 rounded-xl border-2 border-dashed border-slate-700/60 bg-slate-800/20 text-center">
          <p className="text-slate-500 text-sm">No certificates added yet.</p>
          <p className="text-slate-600 text-xs mt-1">Add certificates like UN38.3, CE, REACH, RoHS, or UKCA to ensure battery compliance.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid">
            <div className="col-span-3">Cert Type / Standard</div>
            <div className="col-span-3">Issuer / Lab</div>
            <div className="col-span-2">Issue Date</div>
            <div className="col-span-2">Expiry Date</div>
            <div className="col-span-1.5">Status</div>
            <div className="col-span-0.5"></div>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 md:p-0 rounded-xl bg-slate-800/30 border border-slate-700/30 md:border-0 md:bg-transparent"
              >
                {/* Certificate Type */}
                <div className="col-span-3 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Type</label>
                  <select
                    {...register(`certificates.${index}.type` as const)}
                    className={cn(
                      'form-input select-input',
                      errors.certificates?.[index]?.type && 'border-red-500/50'
                    )}
                  >
                    <option value="UN38.3">UN38.3 (Transport Safety)</option>
                    <option value="CE">CE Declaration</option>
                    <option value="UKCA">UKCA Compliance</option>
                    <option value="REACH">REACH (Chemical Safety)</option>
                    <option value="RoHS">RoHS Compliance</option>
                    <option value="IEC 62619">IEC 62619 (Industrial)</option>
                    <option value="UL 9540A">UL 9540A (Thermal Runaway)</option>
                  </select>
                  {errors.certificates?.[index]?.type && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.certificates[index]?.type?.message}</p>
                  )}
                </div>

                {/* Issuer */}
                <div className="col-span-3 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Issuer</label>
                  <input
                    {...register(`certificates.${index}.issuer` as const)}
                    placeholder="e.g. TÜV SÜD, SGS"
                    className={cn(
                      'form-input',
                      errors.certificates?.[index]?.issuer && 'border-red-500/50'
                    )}
                  />
                  {errors.certificates?.[index]?.issuer && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.certificates[index]?.issuer?.message}</p>
                  )}
                </div>

                {/* Issue Date */}
                <div className="col-span-2 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Issue Date</label>
                  <input
                    {...register(`certificates.${index}.issueDate` as const)}
                    type="date"
                    className={cn(
                      'form-input',
                      errors.certificates?.[index]?.issueDate && 'border-red-500/50'
                    )}
                  />
                  {errors.certificates?.[index]?.issueDate && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.certificates[index]?.issueDate?.message}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="col-span-2 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Expiry Date</label>
                  <input
                    {...register(`certificates.${index}.expiryDate` as const)}
                    type="date"
                    className={cn(
                      'form-input',
                      errors.certificates?.[index]?.expiryDate && 'border-red-500/50'
                    )}
                  />
                  {errors.certificates?.[index]?.expiryDate && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.certificates[index]?.expiryDate?.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-1.5 space-y-1 md:space-y-0">
                  <label className="block text-xs text-slate-500 md:hidden mb-1">Status</label>
                  <select
                    {...register(`certificates.${index}.status` as const)}
                    className="form-input select-input"
                  >
                    <option value="VALID">Valid</option>
                    <option value="PENDING">Pending</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="REVOKED">Revoked</option>
                  </select>
                </div>

                {/* Delete */}
                <div className="col-span-0.5 flex items-center justify-end pt-2 md:pt-0">
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
