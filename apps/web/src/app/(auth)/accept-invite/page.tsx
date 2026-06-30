'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/shared/api/client';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsRegister, setNeedsRegister] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    setToken(t);
  }, [searchParams]);

  // Initial check: try to accept invite. If it fails with "Name and password are required", show register form.
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    const checkInvite = async () => {
      try {
        await apiClient.post('/workspace/members/accept', { token });
        setStatus('success');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        const msg = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('name and password are required')) {
          setNeedsRegister(true);
        } else {
          setStatus('error');
          setErrorMessage(msg || 'Invalid or expired invitation link.');
        }
      } finally {
        setChecking(false);
      }
    };

    checkInvite();
  }, [token, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {
    if (!token) return;

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await apiClient.post('/workspace/members/accept', {
        token,
        name: values.name,
        password: values.password
      });
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Invalid Invite Link</h2>
        <p className="text-sm text-zinc-500 font-light">
          This invitation link is missing the required verification token. Please contact your workspace administrator.
        </p>
        <Link 
          href="/login" 
          className="mt-4 w-full h-12 rounded-xl bg-black text-[#efeae3] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Go to Log In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Checking invitation link...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Invite Accepted!</h2>
        <p className="text-sm text-zinc-500 font-light">
          You have successfully joined the workspace. Redirecting to the login page so you can log in...
        </p>
        <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-black animate-[pulse_1s_infinite] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Join Workspace</h2>
        <p className="text-xs text-zinc-400 mt-1 font-medium uppercase tracking-wider">
          {needsRegister 
            ? 'Set up your profile to join the workspace.'
            : 'Accept the invitation to join your team.'
          }
        </p>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-600 leading-normal">
          {errorMessage}
        </div>
      )}

      {needsRegister ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400"
              {...register('name')}
            />
            {errors.name && (
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Password
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

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat password"
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
            {loading ? 'Creating Account...' : 'Create Account & Join'} 
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500 font-light">
            You already have an account! Click below to accept the invitation and link this workspace to your profile.
          </p>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await apiClient.post('/workspace/members/accept', { token });
                setStatus('success');
                setTimeout(() => { router.push('/login'); }, 3000);
              } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.response?.data?.message || 'Failed to accept invitation.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-black text-[#efeae3] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'Accepting...' : 'Accept Invitation & Proceed'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="text-center mt-2">
        <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Checking link...</span>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}
