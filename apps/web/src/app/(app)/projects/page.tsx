'use client';

import React from 'react';
import { Plus, Eye, Share2 } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    { id: '1', name: 'E-Commerce Rebuild', client: 'Nova Studio', status: 'IN_PROGRESS', priority: 'HIGH', budget: '$4,200.00', deadline: '2026-07-15' },
    { id: '2', name: 'Brand Strategy Redesign', client: 'Acme Corp', status: 'KICKOFF', priority: 'MEDIUM', budget: '$1,800.00', deadline: '2026-08-01' },
    { id: '3', name: 'Cloud Migration', client: 'Cyberdyne Systems', status: 'DELIVERED', priority: 'URGENT', budget: '$6,500.00', deadline: '2026-06-30' }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header action */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projects Tracker</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure project pipelines, assignments, and public share portals.</p>
        </div>
        <button className="h-11 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Kanban / List Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400' : project.status === 'KICKOFF' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
                  {project.status}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${project.priority === 'URGENT' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' : project.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                  {project.priority}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{project.name}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">Client: {project.client}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-3">
              <div className="flex justify-between text-xs font-semibold text-zinc-500">
                <span>Budget: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{project.budget}</span></span>
                <span>Deadline: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{project.deadline}</span></span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium">
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
