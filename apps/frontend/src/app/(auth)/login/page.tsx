'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const response = await login(data.email, data.password);
      setAuth(response.user, response.token);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center emerald-glow">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Battery Passport Portal
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide uppercase">
          Battery Passport Platform
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-card rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-100">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to access your battery passport dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={cn(
                'form-input',
                errors.email && 'border-red-500/50 focus:border-red-500'
              )}
              autoComplete="email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn(
                  'form-input pr-11',
                  errors.password && 'border-red-500/50 focus:border-red-500'
                )}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white btn-primary disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-800/50 text-slate-500">Demo credentials</span>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <div>
              <p className="text-slate-300 text-[11px] font-semibold">Admin Account</p>
              <p className="text-slate-500 text-[10px] font-mono">admin@batterypassport.eu</p>
            </div>
            <code className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
              Password123!
            </code>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/30">
            <div>
              <p className="text-slate-300 text-[11px] font-semibold">Manufacturer</p>
              <p className="text-slate-500 text-[10px] font-mono">manufacturer@voltaics.de</p>
            </div>
            <code className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
              Password123!
            </code>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {['EU Battery Regulation', 'ISO 14040', 'GHG Protocol'].map((badge) => (
          <div key={badge} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 text-xs">{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
