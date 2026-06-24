import React from 'react';
import Footer from './_components/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#efeae3] selection:bg-black selection:text-[#efeae3] overflow-x-hidden">
      <div id="main">
        {children}
      </div>
      <Footer />
    </div>
  );
}

