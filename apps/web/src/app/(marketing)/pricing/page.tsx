'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Check, ArrowRight } from 'lucide-react';
import Header from '../_components/Header';
import { PLANS } from '@/shared/config/plans';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export default function PricingPage() {
  const { data: plansRes } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/plans').then((res) => res.data).catch(() => null),
  });

  const plans = (plansRes || PLANS).map((p: any) => ({
    ...p,
    id: p.key || p.id
  }));
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

    gsap.fromTo('.plan-card',
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15,
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

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">

        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="pricing-hero-label text-zinc-500 text-xs font-black uppercase tracking-widest block mb-4">
            Pricing Models
          </span>
          <h1 className="pricing-hero-title text-5xl md:text-[6vw] font-black uppercase tracking-tighter mb-6 leading-none">
            Plans Built For Teams & Agencies
          </h1>
          <p className="pricing-hero-sub text-zinc-600 text-lg leading-relaxed font-light max-w-xl mx-auto">
            Start with our free workspace tier and upgrade whenever you need multi-member collaboration or detailed portal features.
          </p>
        </div>

        <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto mb-24">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              className={`plan-card relative flex flex-col p-6 rounded-3xl justify-between bg-white/60 backdrop-blur-md shadow-sm border ${
                plan.popular
                  ? 'border-black ring-4 ring-black/5'
                  : 'border-black/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-black text-[#efeae3] text-[9px] font-black px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl tracking-widest uppercase">
                  Popular
                </div>
              )}

              <div className="mb-8 text-left">
                <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-black">{plan.name}</h3>
                <p className="text-zinc-505 text-xs font-light leading-relaxed min-h-[36px]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-xs font-bold text-zinc-400">/ {plan.frequency}</span>
                </div>
              </div>

              <Link
                href={`/signup?plan=${plan.id.toLowerCase()}`}
                className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full font-bold uppercase tracking-widest text-xs transition-colors mb-8 ${
                  plan.popular
                    ? 'bg-black hover:bg-zinc-800 text-[#efeae3]'
                    : 'border border-black/20 hover:border-black/40 text-black'
                }`}
              >
                Get Started {plan.popular && <ArrowRight className="w-3.5 h-3.5" />}
              </Link>

              <ul className="flex flex-col gap-3 text-left">
                {plan.features.map((f: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-zinc-600 leading-normal">
                    <Check className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
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
