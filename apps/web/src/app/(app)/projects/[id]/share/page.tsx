'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { Share2, RefreshCw, Copy, ExternalLink, Check, AlertTriangle } from 'lucide-react';

export default function ProjectShareTab() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;
  const { role } = useAuthStore();
  const isManagerOrOwner = role === 'OWNER' || role === 'MANAGER';

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Queries
  const { data: projectRes, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}`).then((res) => res.data),
  });

  const project = projectRes?.data;

  // Mutations
  const regenerateMutation = useMutation({
    mutationFn: () => apiClient.post(`/projects/${projectId}/share-token/regenerate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to regenerate link.');
    }
  });

  const handleCopyLink = () => {
    if (!project?.shareToken) return;
    const url = `${window.location.origin}/portal/${project.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = () => {
    if (confirm('Are you sure you want to regenerate the share link? The previous link will stop working instantly.')) {
      regenerateMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-full bg-black/5 rounded-xl"></div>
        <div className="h-32 bg-black/5 rounded-xl"></div>
      </div>
    );
  }

  if (!project) return null;

  const portalUrl = project.shareToken 
    ? `${window.location.origin}/portal/${project.shareToken}` 
    : '';

  return (
    <div className="flex flex-col gap-6 text-black text-left max-w-2xl">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Share settings */}
      <div className="p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Client Project Portal
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1.5 leading-relaxed">
            Allow your client to inspect milestones progress, download deliverable files, and view comments without registering an account.
          </p>
        </div>

        {project.shareToken ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Portal Share Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={portalUrl}
                  className="flex-1 h-11 px-4 rounded-xl bg-[#f5f2ee] border border-black/10 text-xs focus:outline-none font-bold text-zinc-650"
                />
                
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`h-11 px-4 rounded-xl border border-black/10 hover:bg-black/5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    copied ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'text-zinc-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-4 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Preview</span>
                </a>
              </div>
            </div>

            {isManagerOrOwner && (
              <div className="mt-4 pt-4 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2.5 text-xs text-zinc-500 leading-relaxed max-w-md">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-black uppercase text-[9px] tracking-wide block mb-0.5">Warning</span>
                    Regenerating token makes the current shared portal link stop working. Ensure you notify your client of the new link.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={regenerateMutation.isPending}
                  className="h-10 px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-700 text-rose-600 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate Link'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-black/10 rounded-xl text-center flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase">Share link not generated yet.</span>
            {isManagerOrOwner && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
                className="h-10 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 mt-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {regenerateMutation.isPending ? 'Generating...' : 'Generate Portal Link'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
