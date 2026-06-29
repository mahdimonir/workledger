'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Building, 
  FolderKanban, 
  CheckSquare, 
  Flag, 
  Paperclip, 
  MessageSquare, 
  Share2, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const projectId = params.id as string;

  
  const { data: projectRes, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}`).then((res) => res.data),
  });

  const { data: clientsRes, isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get('/clients').then((res) => res.data),
  });

  const project = projectRes?.data;
  const clients = clientsRes?.data || [];
  const client = project ? clients.find((c: any) => c.id === project.clientId) : null;

  const isLoading = loadingProject || loadingClients;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
        <div className="h-48 bg-black/5 border border-black/5 rounded-2xl"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <h3 className="font-black text-lg uppercase tracking-tight text-black mb-2">Project Not Found</h3>
        <button 
          onClick={() => router.push('/projects')}
          className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tracker
        </button>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', href: `/projects/${projectId}`, icon: FolderKanban, exact: true },
    { name: 'Tasks', href: `/projects/${projectId}/tasks`, icon: CheckSquare },
    { name: 'Milestones', href: `/projects/${projectId}/milestones`, icon: Flag },
    { name: 'Files', href: `/projects/${projectId}/files`, icon: Paperclip },
    { name: 'Comments', href: `/projects/${projectId}/comments`, icon: MessageSquare },
    { name: 'Share link', href: `/projects/${projectId}/share`, icon: Share2 },
  ];

  return (
    <div className="flex flex-col gap-8 text-black text-left">
      {}
      <div className="flex flex-col gap-4">
        <Link 
          href="/projects"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tracker
        </Link>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{project.name}</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Client: {client?.name || 'Unknown'} ({client?.company || 'No Company'})
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${
              project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
              project.status === 'KICKOFF' ? 'bg-blue-100 text-blue-800' :
              project.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 
              project.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-800'
            }`}>
              {project.status.replace('_', ' ')}
            </span>
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${
              project.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
              project.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
              'bg-zinc-150 text-zinc-850'
            }`}>
              {project.priority}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="flex border-b border-black/10 gap-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.exact 
            ? pathname === tab.href 
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-2 ${
                active ? 'text-black font-extrabold' : 'text-zinc-400 hover:text-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
              )}
            </Link>
          );
        })}
      </div>

      {}
      <div>{children}</div>
    </div>
  );
}
