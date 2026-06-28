'use client';

import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Header from '../_components/Header';

const phases = [
  {
    label: 'Phase 01',
    title: 'Foundation — Operations Platform',
    status: 'Live',
    statusStyle: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    items: [
      'Secure workspace data segregation and account safety features',
      'Multi-device session sync and automatic protection',
      'Workspace Client Onboarding & CRM management directory',
      'Project lifecycle tracker with custom stages & status histories',
      'Shareable real-time status link for client portals',
      'Automatic Proposal-to-Project conversion with signed contracts',
      'Milestone-linked deliverable uploads and subtask dependency maps',
      'High-speed automated PDF generation for itemized billing',
      'GDPR Compliance Data Export (Zipped CSV sheets and file packages)',
      'Comprehensive workspace analytics panel secured by role permissions',
    ],
    cardClass: 'project-card',
  },
  {
    label: 'Phase 02',
    title: 'Growth & Collaboration — Pro Upgrade',
    status: 'Planned',
    statusStyle: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    items: [
      'Stripe payment gateway for direct online checkouts',
      'Milestone client sign-off approvals & revision request flows',
      'White-label client portals (custom logos, business branding)',
      'Workspace member invitations (up to 5 roles)',
      'File versioning history tracking for assets',
      'Project templates with reusable common setups',
      'Retainer client recurring invoice scheduler',
      'Financial reports dashboard (revenue tracking, CSV exports)',
    ],
    cardClass: 'glass-card',
  },
  {
    label: 'Phase 03',
    title: 'Corporate & Enterprise — v2.0 Scale',
    status: 'Future',
    statusStyle: 'bg-zinc-100 text-zinc-400 border border-zinc-200',
    items: [
      'Unlimited team members with capacity planning dashboards',
      'Custom domain binding (e.g., portals.youragency.com)',
      'QuickBooks & Xero accounting integrations',
      'Zapier & Make workflow integrations',
      'SSO / SAML enterprise single sign-on authentication',
      'AI-driven Proposal assistant and contract generation guides',
    ],
    cardClass: 'glass-card',
  },
];

export default function RoadmapPage() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });

    gsap.fromTo('.roadmap-label',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo('.roadmap-title',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.35 }
    );
    gsap.fromTo('.roadmap-sub',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
    );

    gsap.utils.toArray<HTMLElement>('.phase-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 80, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.9,
          ease: 'power4.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          },
        }
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#efeae3] text-black font-sans overflow-hidden">

      <div className="pointer-events-none select-none fixed inset-0 -z-10">
        <div className="absolute top-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-white/50 filter blur-[80px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[35vw] h-[35vw] rounded-full bg-zinc-300/30 filter blur-[70px]" />
      </div>

      <Header />

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-32">

        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="roadmap-label text-zinc-500 text-xs font-black uppercase tracking-widest block mb-4">
            
          </span>
          <h1 className="roadmap-title text-5xl md:text-[7vw] font-black uppercase tracking-tighter mb-6 leading-none">
            Product Development Roadmap
          </h1>
          <p className="roadmap-sub text-zinc-600 text-lg leading-relaxed font-light max-w-xl mx-auto">
            Follow our release schedule as we build, iterate, and roll out features designed to simplify client operations.
          </p>
        </div>

        <div className="relative flex flex-col gap-6 max-w-3xl mx-auto">

          <div className="absolute left-[27px] top-8 bottom-8 w-[1px] bg-black/10 hidden md:block" />

          {phases.map((phase, index) => (
            <div key={index} className="phase-card relative flex gap-8 items-start">

              <div className="hidden md:flex flex-col items-center flex-shrink-0">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-black uppercase tracking-widest border z-10 ${
                  index === 0
                    ? 'bg-black text-[#efeae3] border-black'
                    : 'bg-[#efeae3] text-black border-black/20'
                }`}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              <div className={`flex-1 ${phase.cardClass} rounded-3xl p-8 border border-black/8`}>
                <div className="flex items-start justify-between gap-4 flex-wrap border-b border-black/8 pb-5 mb-6">
                  <div>
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest block mb-1">
                      {phase.label}
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight">{phase.title}</h3>
                  </div>
                  <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest flex-shrink-0 ${phase.statusStyle}`}>
                    {phase.status}
                  </span>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {phase.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 text-xs text-zinc-600 leading-relaxed">
                      <span className="text-black font-black mt-0.5 flex-shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
