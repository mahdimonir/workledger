'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth.store';
import { apiClient } from '@/shared/api/client';
import { Building, Save, Palette, DollarSign, Percent, FileText } from 'lucide-react';

export default function WorkspaceSettingsPage() {
  const queryClient = useQueryClient();
  const { workspace, setSession, accessToken, role } = useAuthStore();
  const isOwner = role === 'OWNER';

  const [name, setName] = useState('');
  const [brandColor, setBrandColor] = useState('#2563EB');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  
  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['workspace-settings'],
    queryFn: () => apiClient.get('/workspace/settings').then((res) => res.data),
    enabled: isOwner || role === 'MANAGER',
  });

  const settings = settingsRes?.data || settingsRes; 

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setBrandColor(settings.brandColor || '#2563EB');
      setDefaultCurrency(settings.defaultCurrency || 'USD');
      setDefaultTaxRate(Number(settings.defaultTaxRate) || 0);
      setInvoicePrefix(settings.invoicePrefix || 'INV');
      setBusinessName(settings.businessName || '');
      setAddress(settings.address || '');
    } else if (workspace) {
      setName(workspace.name || '');
    }
  }, [settings, workspace]);

  
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch('/workspace/settings', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-settings'] });
      setSuccess(true);
      setError('');

      
      if (accessToken && res.data?.data) {
        const user = useAuthStore.getState().user;
        if (user) {
          setSession(accessToken, {
            user,
            workspace: {
              ...workspace!,
              name: res.data.data.name,
            },
            role: role!,
          });
        }
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save workspace settings.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setError('Only workspace owners can modify brand details.');
      return;
    }
    setSuccess(false);
    updateMutation.mutate({
      name,
      brandColor,
      defaultCurrency,
      defaultTaxRate: Number(defaultTaxRate),
      invoicePrefix,
      businessName,
      address,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-full bg-black/5 rounded-xl"></div>
        <div className="h-32 bg-black/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black">Workspace & Brand Settings</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
          Adjust billing defaults, brand specifications, and business invoices attributes.
        </p>
      </div>

      {success && (
        <div className="p-3.5 text-xs rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-center">
          Workspace parameters saved successfully!
        </div>
      )}

      {error && (
        <div className="p-3.5 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> Workspace Display Name *
          </label>
          <input
            type="text"
            required
            disabled={!isOwner}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black disabled:bg-[#f5f2ee] disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            Registered Business Entity Name
          </label>
          <input
            type="text"
            disabled={!isOwner}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Acme Corporation LLC"
            className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black disabled:bg-[#f5f2ee] disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Business Address</label>
          <textarea
            disabled={!isOwner}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Physical office address printed on invoices"
            rows={2}
            className="p-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none disabled:bg-[#f5f2ee] disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Default Invoice Currency
            </label>
            <select
              disabled={!isOwner}
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider disabled:bg-[#f5f2ee]"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Default Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              disabled={!isOwner}
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
              className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black disabled:bg-[#f5f2ee]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Invoices Sequence Prefix
            </label>
            <input
              type="text"
              disabled={!isOwner}
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black uppercase font-bold disabled:bg-[#f5f2ee]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> Primary Brand Theme Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                disabled={!isOwner}
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-11 w-16 p-1 rounded-xl bg-white border border-black/10 focus:outline-none cursor-pointer disabled:bg-[#f5f2ee]"
              />
              <input
                type="text"
                disabled={!isOwner}
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black uppercase font-mono disabled:bg-[#f5f2ee]"
              />
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg w-fit px-6"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Brand Settings'}
          </button>
        )}
      </form>
    </div>
  );
}
