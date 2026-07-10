'use client';

import { useFormContext } from 'react-hook-form';
import { PassportFormData } from './index';
import QRCode from 'react-qr-code';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generatePassportId } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StepIdentification() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<PassportFormData>();
  const [copied, setCopied] = useState(false);

  const passportId = watch('passportId');
  const serialNumber = watch('serialNumber');

  const regenerateId = () => {
    setValue('passportId', generatePassportId());
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(passportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrValue = passportId
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://battery-passport.com'}/public-passport/${passportId}`
    : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: Form Fields */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Battery Passport ID
            <span className="ml-1.5 text-xs text-slate-500">(Auto-generated)</span>
          </label>
          <div className="relative">
            <input
              {...register('passportId')}
              readOnly
              className="form-input pr-20 font-mono bg-slate-900/80 text-emerald-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={copyId}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
                title="Copy ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={regenerateId}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {errors.passportId && (
            <p className="text-red-400 text-xs mt-1">{errors.passportId.message}</p>
          )}
          <p className="text-slate-600 text-xs mt-1">
            Format: BAT-YEAR-XXXXX · This ID will be embedded in the QR code
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Serial Number
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            {...register('serialNumber')}
            placeholder="SN-2024-XXXXX"
            className={cn('form-input font-mono', errors.serialNumber && 'border-red-500/50')}
          />
          {errors.serialNumber && (
            <p className="text-red-400 text-xs mt-1">{errors.serialNumber.message}</p>
          )}
          <p className="text-slate-600 text-xs mt-1">
            Manufacturer&apos;s serial number — must be unique
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
          <h4 className="text-emerald-400 text-sm font-semibold mb-2">About Battery Passport IDs</h4>
          <ul className="space-y-1.5 text-slate-400 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              The Passport ID is permanent and cannot be changed after creation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              A QR code will be generated linking to the public passport view
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">→</span>
              Compliant with EU Battery Regulation 2023/1542 Article 77
            </li>
          </ul>
        </div>
      </div>

      {/* Right: QR Code Preview */}
      <div className="flex flex-col items-center justify-center">
        <div className="glass-card rounded-xl p-6 flex flex-col items-center gap-4 w-full">
          <h3 className="text-sm font-semibold text-slate-300">QR Code Preview</h3>

          {passportId ? (
            <div className="p-4 bg-white rounded-xl">
              <QRCode
                value={qrValue}
                size={160}
                style={{ display: 'block' }}
                level="M"
              />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-xl bg-slate-800/50 border-2 border-dashed border-slate-600 flex items-center justify-center">
              <p className="text-slate-600 text-xs text-center">
                Enter Passport ID to preview
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="font-mono text-emerald-400 text-sm font-semibold">{passportId}</p>
            <p className="text-slate-600 text-xs mt-1">
              Scan to view public passport
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
