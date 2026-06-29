'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SlideOver({
  title,
  isOpen,
  onClose,
  children,
}: SlideOverProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide-over panel */}
        <div className="w-screen max-w-md bg-[#efeae3] border-l border-black/10 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 text-left">
          {/* Header */}
          <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-[#f5f2ee]">
            <h2 className="text-sm font-black uppercase tracking-widest text-black">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-zinc-500 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
