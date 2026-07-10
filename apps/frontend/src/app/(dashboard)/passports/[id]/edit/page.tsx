'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  Fingerprint, Package, Layers, Leaf, ShieldCheck, RefreshCw,
  ClipboardCheck, ChevronLeft, ChevronRight, Loader2, Check, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { passportSchema, PassportFormData } from '@/components/passport/PassportForm';
import { StepIdentification } from '@/components/passport/PassportForm/StepIdentification';
import { StepProductInfo } from '@/components/passport/PassportForm/StepProductInfo';
import { StepMaterialInfo } from '@/components/passport/PassportForm/StepMaterialInfo';
import { StepCarbonInfo } from '@/components/passport/PassportForm/StepCarbonInfo';
import { StepCompliance } from '@/components/passport/PassportForm/StepCompliance';
import { StepCircularity } from '@/components/passport/PassportForm/StepCircularity';
import { StepReview } from '@/components/passport/PassportForm/StepReview';
import { usePassport } from '@/lib/hooks/usePassports';
import { updatePassport } from '@/lib/api/passports';

const STEPS = [
  { id: 1, label: 'Identification', icon: Fingerprint, description: 'Battery ID & QR Code' },
  { id: 2, label: 'Product Info', icon: Package, description: 'Model & Specifications' },
  { id: 3, label: 'Materials', icon: Layers, description: 'Composition & Supply Chain' },
  { id: 4, label: 'Carbon Data', icon: Leaf, description: 'Emissions & Carbon Footprint' },
  { id: 5, label: 'Compliance', icon: ShieldCheck, description: 'Certifications & Standards' },
  { id: 6, label: 'Circularity', icon: RefreshCw, description: 'Recycling & Warranty' },
  { id: 7, label: 'Review', icon: ClipboardCheck, description: 'Final Summary' },
];

export default function EditPassportPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const { data: passport, isLoading } = usePassport(id);

  const methods = useForm<PassportFormData>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      passportId: '',
      serialNumber: '',
      batteryType: 'EV',
      chemistry: 'NMC',
      materials: [],
      certificates: [],
    },
    mode: 'onBlur',
  });

  // Pre-fill form with existing passport data
  useEffect(() => {
    if (passport && !prefilled) {
      const p = passport as any;
      const materialEntries = p.materialComposition
        ? Object.entries(p.materialComposition as Record<string, any>).map(([name, v]) => ({
            name,
            percentage: v?.percentage ?? 0,
            originCountry: v?.origin ?? '',
            supplier: v?.supplier ?? '',
          }))
        : [];

      methods.reset({
        passportId: p.passportId ?? '',
        serialNumber: p.serialNumber ?? '',
        model: p.model ?? '',
        batteryType: p.batteryType ?? 'EV',
        chemistry: p.chemistry ?? 'NMC',
        productionDate: p.productionDate
          ? new Date(p.productionDate).toISOString().split('T')[0]
          : '',
        intendedUse: p.intendedUse ?? '',
        capacityKwh: p.capacity ?? undefined,
        nominalVoltageV: p.nominalVoltage ?? undefined,
        countryOfOrigin: p.countryOfOrigin ?? '',
        carbonFootprintKgCo2eKwh: p.carbonFootprint ?? undefined,
        ghgEmissions: p.ghgEmissions ?? undefined,
        manufacturingSiteEmissions: p.manufacturingSiteEmissions ?? undefined,
        recycledContentPercent: p.recycledContent ?? undefined,
        recyclingInformation: p.recyclingInfo ?? '',
        circularityScore: p.circularityScore ?? undefined,
        warrantyStartDate: p.warrantyStart
          ? new Date(p.warrantyStart).toISOString().split('T')[0]
          : '',
        warrantyEndDate: p.warrantyEnd
          ? new Date(p.warrantyEnd).toISOString().split('T')[0]
          : '',
        warrantyKm: p.warrantyKm ?? undefined,
        materials: materialEntries,
        certificates: [],
      });
      setPrefilled(true);
    }
  }, [passport, prefilled, methods]);


  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const handleNext = async () => {
    let fieldsToValidate: (keyof PassportFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['passportId', 'serialNumber'];
    if (currentStep === 2) fieldsToValidate = ['model', 'batteryType', 'chemistry', 'productionDate', 'countryOfOrigin'];
    const valid = fieldsToValidate.length === 0 || await methods.trigger(fieldsToValidate);
    if (valid) setCurrentStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const onInvalid = (errors: any) => {
    console.warn('Form validation failed:', errors);
    const findFirstError = (obj: any): string | null => {
      if (!obj) return null;
      if (obj.message) return obj.message;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'object') {
          const msg = findFirstError(val);
          if (msg) return msg;
        }
      }
      return null;
    };
    const msg = findFirstError(errors);
    setError(msg ? `Validation Error: ${msg}` : 'Form validation failed. Please check all fields.');
  };

  const onSubmit = async (data: PassportFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updatePassport(id, data as any);
      router.push(`/passports/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update passport');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading passport data...</p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">Passport not found.</p>
        <button onClick={() => router.push('/passports')} className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-sm">Back to Passports</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/passports/${id}`)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Battery Passport</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Editing: <span className="text-emerald-400 font-mono">{passport.passportId}</span>
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="glass-card rounded-2xl p-6">
        <div className="relative mb-8">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-700/50" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-slate-900',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                        ? 'border-emerald-500 text-emerald-400'
                        : 'border-slate-700 text-slate-600'
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={cn('text-xs font-semibold', isActive ? 'text-emerald-400' : isCompleted ? 'text-slate-300' : 'text-slate-600')}>{step.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)}>
            <div className="min-h-[400px]">
              {currentStep === 1 && <StepIdentification />}
              {currentStep === 2 && <StepProductInfo />}
              {currentStep === 3 && <StepMaterialInfo />}
              {currentStep === 4 && <StepCarbonInfo />}
              {currentStep === 5 && <StepCompliance />}
              {currentStep === 6 && <StepCircularity />}
              {currentStep === 7 && <StepReview />}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-700/30 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-xs text-slate-500">Step {currentStep} of {STEPS.length}</span>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-sm font-semibold shadow-lg shadow-emerald-900/30"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-sm font-semibold shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
