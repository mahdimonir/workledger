'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/shared/api/client';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    setToken(t);
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema as any),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Reset token is missing or invalid. Please check your email link.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await apiClient.post('/auth/password/reset', {
        token,
        password: values.password
      });
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Invalid Reset Link</h2>
        <p className="text-sm text-zinc-500 font-light">
          This password reset link is missing a verification token. Please check your email or request a new link.
        </p>
        <Link 
          href="/forgot-password" 
          className="mt-4 w-full h-12 rounded-xl bg-black text-[#efeae3] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Request New Link <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Password Updated</h2>
        <p className="text-sm text-zinc-500 font-light">
          Your password has been successfully updated. Redirecting to the login page...
        </p>
        <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-black animate-[pulse_1s_infinite] w-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Reset Password</h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium uppercase tracking-wider">
          Enter a secure new password for your account.
        </p>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-600 leading-normal">
          {errorMessage}
        </div>
      )}

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Confirm Password field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat new password"
            className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-black text-[#efeae3] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer mt-2"
      >
        {loading ? 'Updating Password...' : 'Save New Password'} 
        {!loading && <ArrowRight className="w-4 h-4" />}
      </button>

      <div className="text-center mt-2">
        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading form...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
