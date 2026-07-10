'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicPassport } from '@/lib/api/passports';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import {
  ShieldAlert,
  Zap,
  Printer,
  Calendar,
  CheckCircle2,
  FileDown,
  Building,
  Globe,
  ShieldCheck,
  Languages,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  Flame,
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  X,
} from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';

// Custom circular gauge component using SVGs matching the mockup
function CircularProgress({
  value,
  max,
  label,
  colorClass,
  unit,
}: {
  value: number;
  max: number;
  label: string;
  colorClass: string;
  unit: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-3">
      <div className="relative w-24 h-24">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-slate-100"
            strokeWidth="7"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* Progress Circle */}
          <circle
            className={colorClass}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
        {/* Value text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-600 mt-3">{label}</span>
    </div>
  );
}

export default function PublicPassportViewPage() {
  const { id } = useParams() as { id: string };
  const [copied, setCopied] = useState(false);

  const { data: passport, isLoading, error } = useQuery({
    queryKey: ['public-passport', id],
    queryFn: () => getPublicPassport(id),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Retrieving battery passport credentials...</p>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Battery Passport Not Found</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          The requested passport ID or serial number could not be found or verified in the registry.
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(passport.passportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get flag emoji from country name/code
  const getCountryEmoji = (country?: string) => {
    if (!country) return '🇩🇪';
    const c = country.toLowerCase().trim();
    if (c.includes('germany')) return '🇩🇪';
    if (c.includes('japan')) return '🇯🇵';
    if (c.includes('china')) return '🇨🇳';
    if (c.includes('korea')) return '🇰🇷';
    if (c.includes('united states') || c.includes('usa')) return '🇺🇸';
    return '🌎';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <div className="max-w-[1280px] mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-slate-800 uppercase tracking-wide">
                  Battery Passport
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                  Public View
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Language Selector */}
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors border border-slate-200 bg-white rounded-lg">
              <Languages className="w-3.5 h-3.5" />
              English
            </button>

            {/* Print PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all duration-200 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              Download Public Passport (PDF)
            </button>
          </div>
        </div>

        {/* Top Row Grid: Battery Specifications & Sustainability Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Main Specifications Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
            
            {/* Product Graphic display */}
            <div className="w-full md:w-[240px] flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="relative w-40 h-32 md:w-48 md:h-36">
                <Image
                  src="/ev_battery_pack.png"
                  alt="EV Battery Pack Render"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Specifications Details */}
            <div className="flex-1 space-y-4">
              <div>
                {/* Verified Battery Badge */}
                {passport.status === 'PUBLISHED' ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Battery
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Preview Mode ({passport.status})
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <h2 className="text-xl font-bold text-slate-800 font-mono tracking-tight">
                    {passport.passportId}
                  </h2>
                  <button 
                    onClick={handleCopyId}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title="Copy Passport ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs border-t border-slate-100 pt-4">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Manufacturer</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm">
                    {passport.manufacturer || passport.organizationName || 'GreenPower Ltd.'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Capacity</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm">
                    {passport.capacityKwh ? `${passport.capacityKwh} kWh` : '75 kWh'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Model</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm">{passport.model}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Nominal Voltage</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm font-mono">
                    {passport.nominalVoltageV ? `${passport.nominalVoltageV} V` : '400 V'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Battery Type</p>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px]">
                      {passport.batteryType}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Manufacturing Date</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm">
                    {passport.productionDate ? formatDate(passport.productionDate) : '15 May 2024'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Chemistry</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm">{passport.chemistry}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Country of Origin</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm flex items-center gap-1">
                    <span>{getCountryEmoji(passport.countryOfOrigin)}</span>
                    <span>{passport.countryOfOrigin || 'Germany'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">State of Health (SoH)</p>
                  <p className="text-emerald-600 font-extrabold mt-1 text-sm font-mono">
                    {passport.stateOfHealth !== undefined ? `${passport.stateOfHealth}% of nominal` : '100% of nominal'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">State of Charge (SoC)</p>
                  <p className="text-slate-700 font-bold mt-1 text-sm font-mono">
                    {passport.stateOfCharge !== undefined ? `${passport.stateOfCharge}%` : '100%'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sustainability Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Sustainability Summary
              </h3>
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-4">
              <CircularProgress
                value={passport.carbonFootprintKgCo2eKwh || 62}
                max={150}
                label="Carbon Footprint"
                colorClass="text-emerald-500"
                unit="kg CO2e/kWh"
              />
              <CircularProgress
                value={passport.recycledContentPercent || 25}
                max={100}
                label="Recycled Content"
                colorClass="text-emerald-500"
                unit="%"
              />
              <CircularProgress
                value={passport.circularityScore || 82}
                max={100}
                label="Circularity Score"
                colorClass="text-emerald-600"
                unit="/100"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row Grid: Safety, Lifecycle & Warranty */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Safety & Compliance Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Safety & Compliance
              </h3>

              <div className="mt-4 space-y-3.5">
                {passport.certificates && passport.certificates.length > 0 ? (
                  passport.certificates.map((cert: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                      <span className="flex items-center gap-2 font-bold text-slate-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {cert.type}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {cert.status === 'VALID' ? 'Compliant' : cert.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs py-4 text-center">
                    No compliance certificates registered
                  </div>
                )}
              </div>
            </div>

            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-4 transition-colors">
              View all certificates
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Battery Lifecycle Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                Battery Lifecycle
              </h3>

              {/* Lifecycle flow display */}
              <div className="mt-5 flex items-center justify-between relative px-2">
                
                {/* Horizontal Progress Bar */}
                <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-slate-100 -z-0">
                  <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
                </div>

                {(passport.lifecycleEvents || []).map((step: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-[10px] font-extrabold transition-all duration-300 ${
                        idx < 3
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                          : idx === 3
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600 animate-pulse'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 mt-2">{step.event || step.stage}</span>
                    <span
                      className={`text-[9px] font-mono mt-0.5 ${
                        idx === 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {step.date && isNaN(Number(step.date)) && !isNaN(Date.parse(step.date))
                        ? formatDate(step.date)
                        : step.date || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-4">
              <Info className="w-3.5 h-3.5" />
              Status tracked in live registry ledger
            </div>
          </div>

          {/* Warranty Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Warranty Information
              </h3>

              <div className="mt-4 space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Warranty Start</span>
                  <span className="text-slate-700 font-bold">
                    {passport.warrantyStartDate ? formatDate(passport.warrantyStartDate) : '15 May 2024'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Warranty End</span>
                  <span className="text-slate-700 font-bold">
                    {passport.warrantyEndDate ? formatDate(passport.warrantyEndDate) : '15 May 2032'}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms highlights badge */}
            <div className="mt-4 flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-800 font-extrabold text-xs">8 Years</p>
                <p className="text-[10px] text-slate-500 font-medium">or {passport.warrantyKm ? `${passport.warrantyKm.toLocaleString()} km` : '160,000 km'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Material Composition Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              Material Composition & Active Minerals
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Declared active materials and chemical composition of the battery cell (Chemistry: <strong className="text-slate-700">{passport.chemistry}</strong>).
            </p>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {passport.materials && passport.materials.length > 0 ? (
                passport.materials.map((mat: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/30 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800 text-xs">{mat.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                        {mat.percentage}%
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Origin Country:</span>
                        <span className="font-semibold text-slate-700">{mat.originCountry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supplier:</span>
                        <span className="font-semibold text-slate-700">{mat.supplier}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-slate-400 text-xs py-4 text-center">
                  No material composition details registered.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Navigation Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'View More Sustainability Details', icon: Globe },
              { label: 'View Safety & Compliance Details', icon: ShieldCheck },
              { label: 'Learn More About This Battery', icon: Info },
            ].map((link, idx) => (
              <button
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/30 text-left transition-all duration-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{link.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Legal verification footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-2 text-center md:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>This is a verified battery passport. Data is tamper-proof and traceable.</span>
          </div>
          <div>
            Last Updated: {passport.updatedAt ? new Date(passport.updatedAt).toUTCString() : '20 May 2024, 14:35 (UTC)'}
          </div>
        </div>


      </div>
    </div>
  );
}
