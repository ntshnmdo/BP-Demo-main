'use client';

import { PassportForm } from '@/components/passport/PassportForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPassportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/passports"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Create Battery Passport</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Complete all sections to generate a compliant battery passport
          </p>
        </div>
      </div>

      <PassportForm />
    </div>
  );
}
