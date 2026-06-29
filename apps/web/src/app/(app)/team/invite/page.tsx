'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function InviteTeamMemberPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');

  
  const inviteMutation = useMutation({
    mutationFn: (newInvite: any) => apiClient.post('/workspace/members/invite', newInvite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      router.push('/team');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to send workspace invitation.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    inviteMutation.mutate({
      email,
      role,
    });
  };

  return (
    <div className="flex flex-col gap-8 text-black text-left max-w-xl">
      {}
      <div className="flex flex-col gap-4">
        <Link 
          href="/team"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Invite Team Member</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
            Add a colleague or contributor to join this workspace.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Colleague Email Address *</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@yourcompany.com"
            className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Permissions Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
          >
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <span className="text-[9px] font-bold text-zinc-400 leading-normal mt-1 uppercase">
            Managers can issue invoices, proposals, and projects. Members can participate in tasks/comments.
          </span>
        </div>

        <button 
          type="submit"
          disabled={inviteMutation.isPending}
          className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
        >
          <UserPlus className="w-4 h-4" />
          {inviteMutation.isPending ? 'Sending Invitation...' : 'Send Workspace Invite'}
        </button>
      </form>
    </div>
  );
}
