'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Fingerprint,
  Package,
  Layers,
  Leaf,
  ShieldCheck,
  RefreshCw,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepIdentification } from './StepIdentification';
import { StepProductInfo } from './StepProductInfo';
import { StepMaterialInfo } from './StepMaterialInfo';
import { StepCarbonInfo } from './StepCarbonInfo';
import { StepCompliance } from './StepCompliance';
import { StepCircularity } from './StepCircularity';
import { StepReview } from './StepReview';
import { createPassport } from '@/lib/api/passports';
import { generatePassportId } from '@/lib/utils';

const emptyToUndefined = (val: any) => {
  if (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
    return undefined;
  }
  return Number(val);
};

export const passportSchema = z.object({
  // Step 1: Identification
  passportId: z.string().min(1, 'Passport ID is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),

  // Step 2: Product Info
  model: z.string().min(1, 'Model name is required'),
  batteryType: z.enum(['EV', 'INDUSTRIAL', 'STATIONARY', 'CONSUMER', 'MARINE']),
  chemistry: z.enum(['NMC', 'LFP', 'NCA', 'LMO', 'LTO', 'SOLID_STATE', 'OTHER']),
  productionDate: z.string().min(1, 'Production date is required'),
  intendedUse: z.string().optional(),
  capacityKwh: z.preprocess(emptyToUndefined, z.number().positive('Must be positive').optional()),
  nominalVoltageV: z.preprocess(emptyToUndefined, z.number().positive('Must be positive').optional()),
  countryOfOrigin: z.string().min(1, 'Country of origin is required'),

  // Step 3: Materials
  materials: z.array(
    z.object({
      name: z.string().min(1),
      percentage: z.preprocess(emptyToUndefined, z.number().min(0).max(100)),
      originCountry: z.string().min(1),
      supplier: z.string().min(1),
    })
  ).optional(),

  // Step 4: Carbon
  carbonFootprintKgCo2eKwh: z.preprocess(emptyToUndefined, z.number().min(0).optional()),
  ghgEmissions: z.preprocess(emptyToUndefined, z.number().min(0).optional()),
  manufacturingSiteEmissions: z.preprocess(emptyToUndefined, z.number().min(0).optional()),

  // Step 5: Compliance
  certificates: z.array(
    z.object({
      type: z.string().min(1),
      issuer: z.string().min(1),
      issueDate: z.string().min(1),
      expiryDate: z.string().min(1),
      status: z.enum(['VALID', 'EXPIRED', 'PENDING', 'REVOKED']),
    })
  ).optional(),

  // Step 6: Circularity
  recycledContentPercent: z.preprocess(emptyToUndefined, z.number().min(0).max(100).optional()),
  recyclingInformation: z.string().optional(),
  circularityScore: z.preprocess(emptyToUndefined, z.number().min(0).max(100).optional()),
  warrantyStartDate: z.string().optional(),
  warrantyEndDate: z.string().optional(),
  warrantyKm: z.preprocess(emptyToUndefined, z.number().min(0).optional()),
  stateOfHealth: z.preprocess(emptyToUndefined, z.number().min(0).max(100).optional()),
  stateOfCharge: z.preprocess(emptyToUndefined, z.number().min(0).max(100).optional()),
});

export type PassportFormData = z.infer<typeof passportSchema>;

const STEPS = [
  { id: 1, label: 'Identification', icon: Fingerprint, description: 'Battery ID & QR Code' },
  { id: 2, label: 'Product Info', icon: Package, description: 'Model & Specifications' },
  { id: 3, label: 'Materials', icon: Layers, description: 'Composition & Supply Chain' },
  { id: 4, label: 'Carbon Data', icon: Leaf, description: 'Emissions & Carbon Footprint' },
  { id: 5, label: 'Compliance', icon: ShieldCheck, description: 'Certifications & Standards' },
  { id: 6, label: 'Circularity', icon: RefreshCw, description: 'Recycling & Warranty' },
  { id: 7, label: 'Review', icon: ClipboardCheck, description: 'Final Summary' },
];

export function PassportForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<PassportFormData>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      passportId: generatePassportId(),
      serialNumber: `SN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      batteryType: 'EV',
      chemistry: 'NMC',
      materials: [],
      certificates: [],
    },
    mode: 'onBlur',
  });

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const handleAutofill = () => {
    const randomModels = [
      'VoltPack Ultra 100', 'EcoPower Home 10', 'VoltPack Industrial 150',
      'VoltPack Economy 60', 'EcoPower Stationary 500', 'VoltPack Sport 75',
      'Apex Grid Storage 1000', 'VoltPack Marine 200'
    ];
    const randomUses = [
      'Commercial Fleet EV', 'Residential Solar Storage', 'High-drain Industrial Machinery',
      'Grid Peak Shaving', 'Light Passenger EV'
    ];
    const randomCountries = ['Germany', 'Netherlands', 'Sweden', 'Finland', 'Chile', 'Zambia'];
    const randomTypes = ['EV', 'INDUSTRIAL', 'STATIONARY'] as const;
    const randomChems = ['NMC', 'LFP', 'NCA', 'LMO', 'LTO'] as const;

    const model = randomModels[Math.floor(Math.random() * randomModels.length)];
    const serialNumber = `SN-2024-${Math.floor(100000 + Math.random() * 900000)}`;
    const batteryType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    const chemistry = randomChems[Math.floor(Math.random() * randomChems.length)];
    const countryOfOrigin = randomCountries[Math.floor(Math.random() * randomCountries.length)];
    const intendedUse = randomUses[Math.floor(Math.random() * randomUses.length)];

    methods.reset({
      passportId: generatePassportId(),
      serialNumber,
      model,
      batteryType,
      chemistry,
      productionDate: '2024-04-12',
      intendedUse,
      capacityKwh: Math.floor(50 + Math.random() * 450),
      nominalVoltageV: Math.floor(200 + Math.random() * 600),
      countryOfOrigin,
      carbonFootprintKgCo2eKwh: Math.floor(40 + Math.random() * 80),
      ghgEmissions: Math.floor(50 + Math.random() * 150),
      manufacturingSiteEmissions: Math.floor(10 + Math.random() * 40),
      recycledContentPercent: Math.floor(5 + Math.random() * 30),
      recyclingInformation: 'EU compliant recycling via certified partner network. Safe cell extraction guidelines attached.',
      circularityScore: Math.floor(60 + Math.random() * 35),
      warrantyStartDate: '2024-05-01',
      warrantyEndDate: '2032-05-01',
      warrantyKm: 160000,
      stateOfHealth: 96,
      stateOfCharge: 78,
      materials: [
        { name: 'Nickel', percentage: 33, originCountry: 'Finland', supplier: 'Nordic Nickel AS' },
        { name: 'Manganese', percentage: 33, originCountry: 'Zambia', supplier: 'EthicalMinerals SA' },
        { name: 'Cobalt', percentage: 34, originCountry: 'Chile', supplier: 'LithiumSource Asia' }
      ],
      certificates: [
        { type: 'UN38.3', issuer: 'TÜV SÜD Europe', issueDate: '2024-01-10', expiryDate: '2027-01-10', status: 'VALID' },
        { type: 'CE', issuer: 'SGS Certification', issueDate: '2024-01-15', expiryDate: '2029-01-15', status: 'VALID' }
      ]
    });
    setError(null);
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof PassportFormData)[] = [];

    if (currentStep === 1) fieldsToValidate = ['passportId', 'serialNumber'];
    if (currentStep === 2) fieldsToValidate = ['model', 'batteryType', 'chemistry', 'productionDate', 'countryOfOrigin'];

    const valid = fieldsToValidate.length === 0 || await methods.trigger(fieldsToValidate);
    if (valid) setCurrentStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

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
      const passport = await createPassport(data);
      router.push(`/passports/${passport.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create passport');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepIdentification />;
      case 2: return <StepProductInfo />;
      case 3: return <StepMaterialInfo />;
      case 4: return <StepCarbonInfo />;
      case 5: return <StepCompliance />;
      case 6: return <StepCircularity />;
      case 7: return <StepReview />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Step Progress Bar */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Creation Wizard Progress</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Autofill Demo Data
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-6">
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 text-xs text-slate-500">
              {currentStep}/{STEPS.length}
            </div>
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-7 gap-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200',
                    isActive && 'bg-emerald-500/10 border border-emerald-500/30',
                    isCompleted && 'cursor-pointer',
                    !isActive && !isCompleted && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0',
                      isCompleted && 'bg-emerald-500 border-emerald-500',
                      isActive && 'border-emerald-500 bg-emerald-500/10',
                      !isActive && !isCompleted && 'border-slate-700 bg-slate-800'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Icon
                        className={cn(
                          'w-3.5 h-3.5',
                          isActive ? 'text-emerald-400' : 'text-slate-500'
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium text-center leading-tight hidden sm:block',
                      isActive ? 'text-emerald-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-100">
              Step {currentStep}: {STEPS[currentStep - 1].label}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          <div className="animate-fade-in">
            {renderStep()}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  step.id === currentStep
                    ? 'w-6 bg-emerald-500'
                    : step.id < currentStep
                    ? 'w-2 bg-emerald-500/40'
                    : 'w-2 bg-slate-700'
                )}
              />
            ))}
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm font-semibold"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={methods.handleSubmit(onSubmit, onInvalid)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg btn-primary text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Passport
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
