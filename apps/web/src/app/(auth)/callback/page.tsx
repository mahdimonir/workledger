'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/shared/store/auth.store';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      
      setSession(token);
      
      
      router.replace('/dashboard');
    } else {
      
      router.replace('/login');
    }
  }, [searchParams, setSession, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-black">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
        Authenticating Account...
      </span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-4 text-black">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Loading auth state...
        </span>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
