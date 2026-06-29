'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/shared/store/auth.store';
import { Save } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const { user } = useAuthStore();
  
  
  const [proposalAccepted, setProposalAccepted] = useState(true);
  const [proposalRejected, setProposalRejected] = useState(true);
  const [invoiceViewed, setInvoiceViewed] = useState(true);
  const [invoicePaid, setInvoicePaid] = useState(true);
  const [milestoneSignoff, setMilestoneSignoff] = useState(true);
  const [memberInvited, setMemberInvited] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSuccess(true);
    setLoading(false);
  };

  const notificationTypes = [
    { id: 'prop_acc', name: 'Proposal Accepted', desc: 'Notify me immediately when a client signs off on a contract.', checked: proposalAccepted, onChange: setProposalAccepted },
    { id: 'prop_rej', name: 'Proposal Rejected', desc: 'Notify me if a client declines a pitched scope document.', checked: proposalRejected, onChange: setProposalRejected },
    { id: 'inv_view', name: 'Invoice Viewed', desc: 'Notify me as soon as a client opens their unique billing portal link.', checked: invoiceViewed, onChange: setInvoiceViewed },
    { id: 'inv_paid', name: 'Invoice Paid', desc: 'Notify me when payments are logged or marked complete.', checked: invoicePaid, onChange: setInvoicePaid },
    { id: 'milestone', name: 'Milestone Signed Off', desc: 'Send alerts when clients request revisions or sign off on milestones.', checked: milestoneSignoff, onChange: setMilestoneSignoff },
    { id: 'member', name: 'Member Invited', desc: 'Alert when coworkers join or accept workspace onboarding links.', checked: memberInvited, onChange: setMemberInvited },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Notification Rules</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
          Configure email dispatch rules for major workspace lifecycle events.
        </p>
      </div>

      {success && (
        <div className="p-3.5 text-xs rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-center">
          Notification preferences saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 divide-y divide-black/5">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-start justify-between gap-6 pt-4 first:pt-0">
              <div className="flex flex-col text-left">
                <span className="text-xs font-black uppercase tracking-tight text-black">{type.name}</span>
                <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wide leading-normal">
                  {type.desc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={type.checked}
                onChange={(e) => type.onChange(e.target.checked)}
                className="w-5 h-5 rounded border-black/25 text-black focus:ring-black cursor-pointer mt-0.5"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-6 flex items-center justify-center gap-2 cursor-pointer shadow-lg w-fit px-6"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
