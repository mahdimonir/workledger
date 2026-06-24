'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden">

      <div 
        className="absolute top-[-10%] left-[25%] w-[50vw] h-[40vh] bg-white opacity-[0.08] rounded-full filter blur-[100px] pointer-events-none -z-10"
        style={{ transform: 'translate3d(0,0,0)' }}
      />

      <div id="footerDiv" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-0 pb-12 border-b border-white/10 relative z-10">

        <div className="flex flex-col gap-1.5 text-left">
          <Link href="/#overview" className="text-[22px] md:text-[36px] font-black text-[#efeae3]/80 hover:text-white transition-colors leading-none tracking-tight">
            Overview
          </Link>
          <Link href="/#features" className="text-[22px] md:text-[36px] font-black text-[#efeae3]/80 hover:text-white transition-colors leading-none tracking-tight">
            Capabilities
          </Link>
          <Link href="/pricing" className="text-[22px] md:text-[36px] font-black text-[#efeae3]/80 hover:text-white transition-colors leading-none tracking-tight">
            Pricing
          </Link>
          <Link href="/roadmap" className="text-[22px] md:text-[36px] font-black text-[#efeae3]/80 hover:text-white transition-colors leading-none tracking-tight">
            Roadmap
          </Link>
        </div>

        <div className="max-w-md flex flex-col gap-6 text-left">
          <p className="text-lg font-medium text-[#efeae3] leading-snug">
            Get operational digests and platform updates straight to your inbox.
          </p>
          <div className="flex border-b border-white/30 py-2 w-full max-w-sm">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="bg-transparent text-sm text-[#efeae3] focus:outline-none placeholder-white/20 w-full"
            />
          </div>
        </div>

      </div>

      <h1 className="select-none pointer-events-none relative z-10">WORKLEDGER</h1>

      <div id="footerBottom" className="flex items-center justify-between text-xs text-white/40 pt-4 relative z-10 font-medium">
        <span>Copyright &copy; WorkLedger</span>
        <span>Proposals</span>
        <span>Invoices</span>
        <a href="/roadmap" className="flex items-center gap-1.5 hover:text-white transition-colors">
          Public Roadmap →
        </a>
      </div>

    </footer>
  );
}
