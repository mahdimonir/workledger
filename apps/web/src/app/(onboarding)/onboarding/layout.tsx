'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const steps = [
    { name: 'Business Profile', path: '/onboarding' },
    { name: 'Invite Team', path: '/onboarding/team' },
    { name: 'First Client', path: '/onboarding/first-client' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.path === pathname);

  return (
    <div className="min-h-screen bg-[#efeae3] text-zinc-900 font-sans flex flex-col justify-between antialiased">
      {/* Premium Header */}
      <header className="h-20 border-b border-black/10 bg-[#f5f2ee] px-6 sm:px-12 flex items-center justify-between">
        <div className="flex flex-col text-left leading-[0.8] select-none font-black text-black">
          <span className="text-[18px] uppercase tracking-tighter">WORK</span>
          <span className="text-[18px] uppercase text-zinc-500 tracking-tighter">LEDGER</span>
        </div>

        {/* Progress Stepper */}
        <div className="hidden md:flex items-center gap-8">
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <div key={step.name} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isActive
                      ? 'bg-black text-[#efeae3] ring-4 ring-black/10'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-550 border border-black/5'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-black transition-all ${
                    isActive ? 'text-black' : 'text-zinc-400'
                  }`}
                >
                  {step.name}
                </span>
                {idx < steps.length - 1 && (
                  <div className="w-12 h-px bg-black/10 ml-2"></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs font-bold text-zinc-550 md:hidden uppercase tracking-wider">
          Step {currentStepIndex + 1} of 3
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 py-12 md:py-16">
        <div className="w-full max-w-xl bg-white/60 backdrop-blur-md rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 px-12 border-t border-black/5 bg-[#f5f2ee]/50 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} WorkLedger. All rights reserved.
      </footer>
    </div>
  );
}
