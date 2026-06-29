'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/client';
import { ArrowLeft, ArrowRight, Plus, Trash } from 'lucide-react';

interface InvitedMember {
  email: string;
  role: 'MANAGER' | 'MEMBER' | 'VIEWER';
  status: 'pending' | 'success' | 'failed';
  errorMsg?: string;
}

export default function InviteTeamStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'MANAGER' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [invites, setInvites] = useState<InvitedMember[]>([]);
  const [error, setError] = useState('');

  const addInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    if (!/\S+@\S+\.\S+/.test(emailInput)) {
      setError('Invalid email address format.');
      return;
    }
    if (invites.some((inv) => inv.email === emailInput)) {
      setError('This email is already in your invite list.');
      return;
    }

    setError('');
    setInvites([
      ...invites,
      { email: emailInput, role: roleInput, status: 'pending' },
    ]);
    setEmailInput('');
  };

  const removeInvite = (idx: number) => {
    setInvites(invites.filter((_, i) => i !== idx));
  };

  const handleNext = async () => {
    setLoading(true);
    setError('');

    // If there are invites, send invitations
    if (invites.length > 0) {
      const updatedInvites = [...invites];
      for (let i = 0; i < updatedInvites.length; i++) {
        const inv = updatedInvites[i];
        if (inv.status === 'success') continue;

        try {
          await apiClient.post('/workspace/members/invite', {
            email: inv.email,
            role: inv.role,
          });
          updatedInvites[i].status = 'success';
        } catch (err: any) {
          console.error(err);
          updatedInvites[i].status = 'failed';
          updatedInvites[i].errorMsg = err.response?.data?.message || 'Failed to send invite.';
        }
      }
      setInvites(updatedInvites);

      // If any failed, show error and let user inspect/retry
      if (updatedInvites.some((inv) => inv.status === 'failed')) {
        setError('Some invitations failed to send. Please review.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push('/onboarding/first-client');
  };

  const handleBack = () => {
    router.push('/onboarding');
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-black">Invite Team Members</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5">
          Collaborate with your coworkers by inviting them to this workspace.
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Invite Form */}
      <form onSubmit={addInvite} className="flex gap-3 items-end">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Colleague Email</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="e.g. colleague@acme.com"
            className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
          />
        </div>

        <div className="w-32 flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</label>
          <select
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value as any)}
            className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
          >
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          className="h-11 w-11 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Invites list */}
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        {invites.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-black/10 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            No colleagues added yet.
          </div>
        ) : (
          invites.map((inv, idx) => (
            <div
              key={inv.email}
              className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 bg-white/40 backdrop-blur-sm"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black">{inv.email}</span>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">
                  Role: {inv.role}
                </span>
                {inv.status === 'failed' && (
                  <span className="text-[9px] font-semibold text-rose-600 mt-0.5">{inv.errorMsg}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {inv.status === 'success' ? (
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                    Invited
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeInvite(idx)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation actions */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          className="h-12 px-6 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-700 font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          {loading
            ? 'Sending...'
            : invites.length === 0
            ? 'I\'ll invite later'
            : 'Send Invites & Next'}{' '}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
