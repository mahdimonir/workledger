'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ArrowLeft, Edit3, Building, Mail, Phone, MapPin, ClipboardList } from 'lucide-react';
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

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clientId = params.id as string;
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch client details
  const { data: clientRes, isLoading: loadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => apiClient.get(`/clients/${clientId}`).then((res) => res.data),
  });

  const client = clientRes?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormValues>({
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

  // Pre-populate form when client is loaded
  useEffect(() => {
    if (client) {
      reset({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || ''
      });
    }
  }, [client, reset]);

  const mutation = useMutation({
    mutationFn: (updatedClient: ClientFormValues) => apiClient.patch(`/clients/${clientId}`, updatedClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      router.push(`/clients/${clientId}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update client.');
    }
  });

  const onSubmit = (values: ClientFormValues) => {
    setErrorMessage('');
    mutation.mutate(values);
  };

  if (loadingClient) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-pulse text-black text-left">
        <div className="h-6 w-32 bg-black/5 rounded-lg"></div>
        <div className="h-[400px] bg-black/5 border border-black/5 rounded-3xl"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">Client Not Found</h3>
        <button 
          onClick={() => router.push('/clients')}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CRM
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 text-black select-none">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/clients/${clientId}`} 
          className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </Link>
      </div>

      <div className="border border-black/10 rounded-3xl bg-[#f5f2ee] p-8 shadow-sm text-left">
        <div className="flex items-center gap-3 border-b border-black/10 pb-6 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#efeae3]">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black">Edit Client Details</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Modify information for {client.company}</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-semibold text-rose-600 leading-normal mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact Person */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                Contact Person
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
                Company Name
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
                Contact Email
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
                Phone Number (Optional)
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
              Billing Address (Optional)
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
              Internal Notes & Terms (Optional)
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
              href={`/clients/${clientId}`} 
              className="h-12 px-6 rounded-xl border border-black/10 hover:bg-black/5 font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="h-12 px-8 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
