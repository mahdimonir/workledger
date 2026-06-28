'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowRight, Check } from 'lucide-react';
import Header from './_components/Header';

export default function PremiumLandingPage() {
  const loaderWords = ['Client CRM', 'Versioned Proposals', 'Milestone Portals', 'Ledger Invoices', 'WorkLedger'];
  const [loaderIndex, setLoaderIndex] = useState(0);
  const [loaderEnded, setLoaderEnded] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [activeImg, setActiveImg] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60');

  const fixedImgRef = useRef<HTMLDivElement>(null);
  const elemContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (loaderIndex < loaderWords.length - 1) {
      const timer = setTimeout(() => {
        setLoaderIndex((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLoaderEnded(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loaderIndex]);

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

    const container = elemContainerRef.current;
    const fixedImg = fixedImgRef.current;

    const onContainerMouseMove = (e: MouseEvent) => {
      if (fixedImg) {
        const imgH = window.innerWidth * 0.30;
        const targetY = e.clientY - imgH / 2;
        gsap.to(fixedImg, {
          y: targetY,
          duration: 0.15,
          ease: 'power2.out',
        });
      }
    };

    if (container) {
      container.addEventListener('mousemove', onContainerMouseMove);
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#projects',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });

    tl.fromTo('.card-tl', { x: -350, y: -350, opacity: 0 }, { x: 0, y: 0, opacity: 1, ease: 'power2.out', duration: 1 }, 0)
      .fromTo('.card-tr', { x:  350, y: -350, opacity: 0 }, { x: 0, y: 0, opacity: 1, ease: 'power2.out', duration: 1 }, 0)
      .fromTo('.card-bl', { x: -350, y:  350, opacity: 0 }, { x: 0, y: 0, opacity: 1, ease: 'power2.out', duration: 1 }, 0)
      .fromTo('.card-br', { x:  350, y:  350, opacity: 0 }, { x: 0, y: 0, opacity: 1, ease: 'power2.out', duration: 1 }, 0);

    tl.to({}, { duration: 0.3 });

    tl.to('.card-tl', { x: -350, y: -350, opacity: 0, ease: 'power2.in', duration: 1 }, '+=0')
      .to('.card-tr', { x:  350, y: -350, opacity: 0, ease: 'power2.in', duration: 1 }, '<')
      .to('.card-bl', { x: -350, y:  350, opacity: 0, ease: 'power2.in', duration: 1 }, '<')
      .to('.card-br', { x:  350, y:  350, opacity: 0, ease: 'power2.in', duration: 1 }, '<');

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (container) container.removeEventListener('mousemove', onContainerMouseMove);
    };
  }, []);

  const features = [
    {
      title: '1. Client Directory',
      subtitle: 'Organize Accounts',
      badge: 'CRM Management',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60',
    },
    {
      title: '2. Versioned Proposals',
      subtitle: 'Build Contracts',
      badge: 'Agreement Versions',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60',
    },
    {
      title: '3. Milestone Portals',
      subtitle: 'Track Deliverables',
      badge: 'Client Review Sign-offs',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60',
    },
    {
      title: '4. Ledger Invoicing',
      subtitle: 'Automate Billing',
      badge: 'Sequential PDF Ledgers',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
    },
  ];

  const projectCases = [
    {
      category: 'Creative Design',
      title: 'Design & Branding Studios',
      metric: '+40% Faster Approvals',
      desc: 'Elegant portal pipelines where clients review assets, leave structured feedback, and sign off deliverables directly — no messy email chains.',
      checks: ['White-labeled portal branding', 'Figma preview embeds', 'Client signature audit log'],
      className: 'card-tl',
    },
    {
      category: 'Technical Dev',
      title: 'Software Consulting Teams',
      metric: 'Zero Scope Creep',
      desc: 'Lock proposals before development begins, track subtask dependencies, and log every scope amendment on a chronological ledger.',
      checks: ['Versioned proposal snapshots', 'Nested subtask checklists', 'Stage transition history logs'],
      className: 'card-tr',
    },
    {
      category: 'Growth Retainers',
      title: 'Digital Marketing Firms',
      metric: '99% Collection Rate',
      desc: 'Manage recurring monthly retainers, track outstanding pipeline balances, and auto-generate itemized PDF invoices.',
      checks: ['Auto-incrementing invoices', 'Part-payment bank records', 'GDPR-compliant zipped packages'],
      className: 'card-bl',
    },
    {
      category: 'Enterprise Scale',
      title: 'Enterprise Operations Firms',
      metric: 'Zero Admin Overhead',
      desc: 'Onboard larger clients with strict role permissions, manage multi-region workspaces, and trigger automatic compliance ledger audits.',
      checks: ['Role-based team permissions', 'Async GDPR ZIP exports', 'Super-admin workspace metrics'],
      className: 'card-br',
    },
  ];

  const slides = [
    {
      logo: 'Studio Alpha',
      beforeAfter: 'Before: 15-day collection lag → After: 2-day clearing',
      text: 'We consolidated onboarding proposals, milestones, and ledgers. Client sign-offs became seamless and fully auditable.',
    },
    {
      logo: 'Nexus Media',
      beforeAfter: 'Before: 12 hrs/wk manual invoices → After: Zero data entry',
      text: 'Our account managers no longer copy-paste billing details. Client portal actions automatically update the ledger.',
    },
    {
      logo: 'Stark Consulting',
      beforeAfter: 'Before: Constant scope debates → After: Signed contract versions',
      text: 'Every proposal amendment is versioned. The historical rollback features resolved all client scope disputes instantly.',
    },
    {
      logo: 'Vivid Growth Labs',
      beforeAfter: 'Before: 40% revision email rate → After: Direct sign-offs',
      text: 'Clients view deliverable previews and toggle approvals directly. Revision email threads dropped dramatically.',
    },
    {
      logo: 'Pinnacle Studio',
      beforeAfter: 'Before: Scattered spreadsheets → After: Unified Client CRM',
      text: 'Having all contacts, pending tasks, and invoice histories in one directory keeps our team operations clean.',
    },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (sliderRef.current) sliderRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (sliderRef.current) sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative bg-[#efeae3] text-black w-full min-h-screen font-sans select-none overflow-hidden">

      <div
        id="loader"
        style={{ transform: loaderEnded ? 'translateY(-100%)' : 'translateY(0%)' }}
      >
        {loaderWords.map((word, idx) => (
          <h1
            key={word}
            style={{
              opacity: loaderIndex === idx ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              visibility: loaderIndex === idx ? 'visible' : 'hidden',
            }}
          >
            {word}
          </h1>
        ))}
      </div>

      <div
        id="fixedImage"
        ref={fixedImgRef}
        className="pointer-events-none"
        style={{
          backgroundImage: activeImg ? `url(${activeImg})` : 'none',
          display: isHovered ? 'block' : 'none',
        }}
      />

      <section id="page1" className="relative flex flex-col justify-between min-h-screen pb-8 md:pb-[4vw] bg-[#efeae3]">
        <Header />

        <div id="center" className="relative z-10">
          <div id="left">
            <h3>
              WorkLedger is a simple operations platform for freelancers and agencies.
              Manage your client directory, draft versioned proposals, track project
              milestones, and automate sequential invoicing.
            </h3>
          </div>
          <div id="right">
            <h1>
              OPERATE<br />YOUR<br />AGENCY
            </h1>
          </div>
        </div>

        <div id="hero-shape" className="pointer-events-none select-none">
          <div id="hero-1" />
          <div id="hero-2" />
          <div id="hero-3" />
        </div>

        <div className="relative w-full mt-6 md:mt-10 z-10">
          <div className="rounded-[30px] overflow-hidden border border-black/5 shadow-2xl bg-black aspect-video max-h-[80vh] w-full">
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover select-none pointer-events-none opacity-90"
              src="/video.mp4"
            />
          </div>
        </div>
      </section>

      <section id="page2" className="relative bg-[#efeae3] overflow-hidden">
        <div id="moving-text" className="select-none">
          {[0, 1, 2].map((i) => (
            <div className="con" key={i}>
              <h1>PROPOSALS</h1>
              <div className="gola" />
              <h1>MILESTONES</h1>
              <div className="gola" />
              <h1>INVOICING</h1>
              <div className="gola" />
              <h1>CLIENT CRM</h1>
              <div className="gola" />
            </div>
          ))}
        </div>

        <div
          id="page2-bottom"
          className="flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0 relative z-10"
        >
          <h1 className="text-3xl md:text-[3.8vw] font-black w-full md:w-[55%] leading-[1] uppercase tracking-tighter text-black text-left">
            We believe that running your business should be simple. No fragmented spreadsheets,
            no disjointed apps. Just clean and organized client operations.
          </h1>
          <div id="bottom-part2" className="w-full md:w-[25%] flex flex-col gap-6 text-left">
            <img
              className="w-full rounded-2xl border border-black/10 shadow-md"
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60"
              alt="Workspace Laptop"
            />
            <p className="text-zinc-600 text-sm font-light leading-relaxed">
              WorkLedger streamlines proposal creation, secures milestone sign-offs, and
              automatically tracks billing balances — so you and your client always know
              exactly what has been completed, reviewed, and is due.
            </p>
          </div>
        </div>

        <div id="gooey" className="pointer-events-none select-none opacity-80" />
      </section>

      <section id="page3" className="relative bg-[#efeae3]">
        <div className="capabilities-header">
          <span className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-2">
            
          </span>
          <h2 className="text-4xl font-black uppercase tracking-tighter">
            Unified Workspace Systems
          </h2>
        </div>

        <div
          id="elem-container"
          ref={elemContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full text-left relative z-10"
        >
          {features.map((feat) => (
            <div
              key={feat.title}
              className="elem group"
              onMouseEnter={() => setActiveImg(feat.image)}
            >
              <div className="overlay" />
              <h2>{feat.title}</h2>
              <div className="elem-right">
                <p>{feat.subtitle}</p>
                <p>{feat.badge}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="projects"
        ref={projectsRef}
        className="py-24 px-[2vw] border-b border-black/10 relative z-10"
      >
        <div className="max-w-7xl mx-auto text-left relative z-10">
          <span className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-2">
            
          </span>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">
            Built For Real Agency Workflows
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {projectCases.map((item, idx) => (
              <div
                key={idx}
                className={`project-card ${item.className} rounded-3xl p-8 flex flex-col justify-between min-h-[400px] text-left`}
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-black/80 text-[#efeae3] rounded-full inline-block backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span className="text-xs font-black text-black tracking-tight">
                      {item.metric}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black uppercase mb-4 leading-tight">{item.title}</h3>
                  <p className="text-zinc-700 text-sm leading-relaxed mb-6">{item.desc}</p>
                </div>

                <div className="border-t border-black/10 pt-4 mt-4 flex flex-col gap-2">
                  {item.checks.map((check, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 text-xs text-zinc-500">
                      <Check className="w-3.5 h-3.5 text-black flex-shrink-0" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="page4" className="relative z-10 text-left border-b border-black/10">
        <div className="relative z-10">
          <span className="text-zinc-500 text-xs font-black uppercase tracking-widest block mb-2">
            
          </span>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-8 md:mb-12">
            Proven Operations Optimization
          </h2>
        </div>

        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="flex gap-6 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing py-6 select-none relative z-10"
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="case-card min-w-[320px] md:min-w-[420px] rounded-3xl p-8 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">
                    [{slide.logo}]
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    Case {idx + 1}
                  </span>
                </div>

                <div className="rounded-xl p-4 mb-6 border border-black/8"
                  style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <p className="text-[11px] font-black uppercase tracking-wider text-black mb-1">
                    Impact Metric
                  </p>
                  <p className="text-xs font-medium text-zinc-800 leading-tight">
                    {slide.beforeAfter}
                  </p>
                </div>

                <h4 className="text-lg md:text-xl font-bold leading-snug mb-8 text-zinc-800 italic">
                  &ldquo;{slide.text}&rdquo;
                </h4>
              </div>

              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Verified Workspace Review
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#efeae3] py-20 px-6 relative z-10 text-center flex flex-col items-center justify-center border-b border-black/5">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-8">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Organize Your Agency Operations
          </h2>
          <p className="text-zinc-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
            Onboard clients, coordinate milestone handovers, and track project financials
            in one simple ledger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/signup"
              className="px-10 h-16 rounded-full bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl transition-colors"
            >
              Register Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-8 h-16 rounded-full border border-black/20 hover:border-black/40 font-bold uppercase tracking-widest text-xs flex items-center justify-center text-zinc-800 transition-colors"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
