'use client';

import React from 'react';
import { useToastStore } from '../store/toast.store';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 flex-row"
            style={{
              background: isSuccess 
                ? 'rgba(239, 246, 238, 0.92)' 
                : isError 
                ? 'rgba(253, 244, 245, 0.92)' 
                : 'rgba(255, 255, 255, 0.92)',
              borderColor: isSuccess 
                ? 'rgba(74, 117, 89, 0.2)' 
                : isError 
                ? 'rgba(195, 60, 84, 0.2)' 
                : 'rgba(0, 0, 0, 0.08)',
              color: isSuccess 
                ? '#1e3f20' 
                : isError 
                ? '#5a121e' 
                : '#000000',
            }}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-zinc-500 shrink-0" />}
            
            <p className="text-sm font-semibold leading-tight flex-1">{toast.message}</p>
            
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
