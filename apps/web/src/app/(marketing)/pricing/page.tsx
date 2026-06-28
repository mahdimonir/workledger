'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Check, ArrowRight } from 'lucide-react';
import Header from '../_components/Header';

const plans = [
  {
    name: 'Foundation',
    price: '$0',
    period: 'forever',
    desc: 'Ideal for solo operators establishing unified workspaces.',
    cta: 'Start Free Workspace',
    href: '/signup',
    featured: false,
    features: [
      'Unlimited Clients & Projects',
      'Full Proposal Builder',
      'Milestones & Task Pipelines',
      'PDF Invoicing Ledger',
      'Zipped GDPR Data Export',
    ],
  },
  {
    name: 'Pro Scale',
    price: '$9',
    period: 'month',
    desc: 'Perfect for collaborative teams needing role-based permissions.',
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    featured: true,
    features: [
      'Everything in Foundation',
      'Invite up to 5 team members',
      'Role-Based Account Permissions',
      'Stripe Online Invoice Payments',
      'White-Labeled Client Portals',
      'File Versioning History Logs',
    ],
  },
];

export default function PricingPage() {
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

    gsap.fromTo('.pricing-hero-label',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo('.pricing-hero-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.35 }
    );
    gsap.fromTo('.pricing-hero-sub',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
    );

    gsap.fromTo('.plan-card-left',
      { x: -120, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%' }
      }
    );
    gsap.fromTo('.plan-card-right',
      { x: 120, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%' }
      }
    );

    gsap.fromTo('.pricing-faq-item',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: '.pricing-faq', start: 'top 85%' }
      }
    );

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#efeae3] text-black font-sans overflow-hidden">

      <div className="pointer-events-none select-none fixed inset-0 -z-10">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-white/50 filter blur-[80px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-zinc-300/30 filter blur-[70px]" />
      </div>

      <Header />

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-32">

        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="pricing-hero-label text-zinc-500 text-xs font-black uppercase tracking-widest block mb-4">
            
          </span>
          <h1 className="pricing-hero-title text-5xl md:text-[7vw] font-black uppercase tracking-tighter mb-6 leading-none">
            Plans Built For Teams & Agencies
          </h1>
          <p className="pricing-hero-sub text-zinc-600 text-lg leading-relaxed font-light max-w-xl mx-auto">
            Start with our free workspace tier and upgrade whenever you need multi-member collaboration or detailed portal features.
          </p>
        </div>

        <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`${i === 0 ? 'plan-card-left' : 'plan-card-right'} relative flex flex-col p-8 rounded-3xl justify-between ${
                plan.featured
                  ? 'project-card border-2 border-black/20'
                  : 'glass-card border border-black/10'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-black text-[#efeae3] text-[9px] font-black px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl tracking-widest uppercase">
                  Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{plan.name}</h3>
                <p className="text-zinc-500 text-xs font-light">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-sm font-bold text-zinc-400">/ {plan.period}</span>
                </div>
              </div>

              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full font-bold uppercase tracking-widest text-xs transition-colors mb-8 ${
                  plan.featured
                    ? 'bg-black hover:bg-zinc-800 text-[#efeae3]'
                    : 'border border-black/20 hover:border-black/40 text-black'
                }`}
              >
                {plan.cta} {plan.featured && <ArrowRight className="w-3.5 h-3.5" />}
              </Link>

              <ul className="flex flex-col gap-3.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-xs text-zinc-600">
                    <Check className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                    <span className={f === 'Everything in Foundation' ? 'font-bold text-black' : ''}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pricing-faq max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-3">
              
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Common Questions
            </h2>
          </div>

          {[
            {
              q: 'Is the Foundation tier actually free forever?',
              a: 'Yes. The Foundation tier has no time limit and no credit card required. You can run your entire solo operation at zero cost indefinitely.',
            },
            {
              q: 'Can I upgrade or downgrade at any time?',
              a: 'Absolutely. Upgrades take effect immediately and you are billed pro-rata. Downgrades take effect at the end of your current billing cycle.',
            },
            {
              q: 'What happens to my data if I downgrade?',
              a: 'All your data is retained. You simply lose access to Pro-only features like team member roles and white-label portals until you upgrade again.',
            },
            {
              q: 'Is there a setup fee or onboarding cost?',
              a: 'None. Create a workspace, add your first client, and you are operational within minutes — no setup fees, no hidden charges.',
            },
          ].map((faq, i) => (
            <div key={i} className="pricing-faq-item glass-card rounded-2xl p-6 mb-4 border border-black/8">
              <p className="font-black text-sm uppercase tracking-tight mb-2">{faq.q}</p>
              <p className="text-zinc-600 text-sm font-light leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
