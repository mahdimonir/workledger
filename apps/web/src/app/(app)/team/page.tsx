'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { Users, UserPlus, Shield, Trash2, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeamDirectoryPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, role: currentUserRole } = useAuthStore();
  const isOwner = currentUserRole === 'OWNER';

  const [error, setError] = useState('');

  
  const { data: membersRes, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => apiClient.get('/workspace/members').then((res) => res.data),
  });

  const members = membersRes?.data || [];

  
  const updateRoleMutation = useMutation<any, any, { memberId: string; role: string }>({
    mutationFn: ({ memberId, role }) => 
      apiClient.patch(`/workspace/members/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update member role.');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => apiClient.delete(`/workspace/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to remove member.');
    }
  });

  const handleRoleChange = (memberId: string, currentRole: string, newRole: string) => {
    if (currentRole === 'OWNER') {
      setError('Cannot change role of workspace OWNER.');
      return;
    }
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string, memberName: string, memberRole: string) => {
    if (memberRole === 'OWNER') {
      setError('Cannot remove the workspace OWNER.');
      return;
    }
    if (confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      removeMemberMutation.mutate(memberId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse text-black">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
          <div className="h-11 w-32 bg-black/5 rounded-lg"></div>
        </div>
        <div className="h-64 bg-black/5 border border-black/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-black text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Workspace Team</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mt-1.5">
            Manage coworkers, adjust permissions, and review invitations.
          </p>
        </div>
        {isOwner && (
          <Link 
            href="/team/invite"
            className="h-12 px-6 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </Link>
        )}
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-black/5/10 text-zinc-500 font-black uppercase tracking-wider">
                <th className="p-5">Name</th>
                <th className="p-5">Email Address</th>
                <th className="p-5">Permissions / Role</th>
                <th className="p-5">Status</th>
                {isOwner && <th className="p-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-zinc-700 font-semibold">
              {members.map((member: any) => {
                const joined = !!member.joinedAt;
                return (
                  <tr key={member.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#efeae3] text-xs font-black uppercase">
                          {member.user?.name?.charAt(0) || 'W'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-black text-sm">{member.user?.name || 'Pending Invite'}</span>
                          {member.userId === currentUser?.id && (
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-zinc-650">{member.user?.email}</td>
                    <td className="p-5">
                      {isOwner && member.userId !== currentUser?.id && member.role !== 'OWNER' ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, member.role, e.target.value)}
                          className="h-9 px-3 rounded-lg bg-white border border-black/10 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black text-black"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MANAGER">Manager</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black">
                          <Shield className="w-3.5 h-3.5 text-zinc-400" /> {member.role}
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                        joined ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {joined ? 'Joined' : 'Invited'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="p-5 text-right flex justify-end gap-2">
                        {member.role !== 'OWNER' && member.userId !== currentUser?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.user?.name || member.user?.email, member.role)}
                            className="p-2.5 rounded-lg border border-black/5 hover:bg-rose-500/10 text-zinc-550 hover:text-rose-600 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
