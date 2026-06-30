'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { generateId } from '@/shared/utils/id';
import { ArrowLeft, UserPlus, Building, Mail, Phone, MapPin, ClipboardList } from 'lucide-react';
import Link from 'next/link';

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  company: z.string().min(2, 'Company name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');
  const idempotencyKey = useRef(generateId());

  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema as any),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (newClient: ClientFormValues) => apiClient.post('/clients', newClient, {
      headers: { 'Idempotency-Key': idempotencyKey.current }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      router.push('/clients');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create client.');
    }
  });

  const onSubmit = (values: ClientFormValues) => {
    setErrorMessage('');
    mutation.mutate(values);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 text-black select-none">
      
      {/* Breadcrumb / Top Row */}
      <div className="flex items-center justify-between">
        <Link 
          href="/clients" 
          className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CRM
        </Link>
      </div>

      <div className="border border-black/10 rounded-3xl bg-[#f5f2ee] p-8 shadow-sm text-left">
        <div className="flex items-center gap-3 border-b border-black/10 pb-6 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#efeae3]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black">Create New Client</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Add a new customer profile to your CRM</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-600 leading-normal mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                <UserPlus className="w-3 h-3 text-zinc-400" /> Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-medium"
                {...register('name')}
              />
              {errors.name && (
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-zinc-400" /> Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corporation"
                className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-medium"
                {...register('company')}
              />
              {errors.company && (
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                  {errors.company.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400" /> Contact Email
              </label>
              <input
                type="email"
                placeholder="e.g. billing@acme.com"
                className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-medium"
                {...register('email')}
              />
              {errors.email && (
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400" /> Phone Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. +1 555 0199"
                className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-medium"
                {...register('phone')}
              />
              {errors.phone && (
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                  {errors.phone.message}
                </span>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-400" /> Billing Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 123 Business Rd, Suite 100, New York, NY"
              className="w-full h-12 bg-black/5 border border-black/10 rounded-xl px-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-medium"
              {...register('address')}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
              <ClipboardList className="w-3 h-3 text-zinc-400" /> Internal Notes & Terms (Optional)
            </label>
            <textarea
              placeholder="Add payment preferences, billing terms, key contact details..."
              rows={4}
              className="w-full bg-black/5 border border-black/10 rounded-xl p-4 text-sm focus:outline-none focus:border-black transition-colors placeholder-zinc-400 font-medium resize-none"
              {...register('notes')}
            />
          </div>

          <div className="flex gap-4 items-center justify-end mt-4 border-t border-black/10 pt-6">
            <Link 
              href="/clients" 
              className="h-12 px-6 rounded-xl border border-black/10 hover:bg-black/5 font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-12 px-8 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              {mutation.isPending ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
