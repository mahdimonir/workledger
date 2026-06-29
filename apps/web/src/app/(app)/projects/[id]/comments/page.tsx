'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { MessageSquare, Trash2, Shield, Eye } from 'lucide-react';

export default function ProjectCommentsTab() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;
  const { user } = useAuthStore();

  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [error, setError] = useState('');

  // Queries
  const { data: commentsRes, isLoading } = useQuery({
    queryKey: ['comments', { projectId }],
    queryFn: () => apiClient.get(`/comments/project/${projectId}`).then((res) => res.data),
  });

  const comments = commentsRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newComment: any) => apiClient.post(`/comments/project/${projectId}`, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', { projectId }] });
      setCommentText('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to add comment.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', { projectId }] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createMutation.mutate({
      content: commentText,
      isInternal,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-28 bg-black/5 rounded-xl"></div>
        <div className="h-20 bg-black/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-black text-left max-w-3xl">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-black/5 bg-white/60 backdrop-blur-md shadow-sm flex flex-col gap-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Post Project Update</h3>
        
        <textarea
          required
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Type project status update, internal memo, or client note..."
          rows={3}
          className="p-4 rounded-xl bg-white border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
        />

        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* Internal toggle buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsInternal(true)}
              className={`h-9 px-3.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                isInternal
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  : 'border-black/10 text-zinc-400 hover:text-black hover:bg-black/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Team Only (Internal)
            </button>
            
            <button
              type="button"
              onClick={() => setIsInternal(false)}
              className={`h-9 px-3.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                !isInternal
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'border-black/10 text-zinc-400 hover:text-black hover:bg-black/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Client Visible (Portal)
            </button>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="h-10 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            Send Message
          </button>
        </div>
      </form>

      {/* Messages Feed */}
      <div className="flex flex-col gap-4 mt-2">
        {comments.length === 0 ? (
          <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <MessageSquare className="w-10 h-10 text-zinc-300 mb-2" />
            <p className="text-zinc-550 text-xs font-bold uppercase tracking-wider">No comments logged yet</p>
          </div>
        ) : (
          comments.map((comment: any) => {
            const isAuthor = user?.id === comment.userId;
            return (
              <div 
                key={comment.id}
                className={`p-5 rounded-2xl border bg-white/60 backdrop-blur-md flex flex-col gap-3.5 shadow-sm relative ${
                  comment.isInternal 
                    ? 'border-indigo-150 border-l-4 border-l-indigo-600' 
                    : 'border-emerald-150 border-l-4 border-l-emerald-600'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[#efeae3] text-[10px] font-black uppercase">
                      {comment.user?.name?.charAt(0) || 'W'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-black text-xs text-black uppercase tracking-tight">{comment.user?.name || 'User'}</span>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        {comment.isInternal ? (
                          <><Shield className="w-2.5 h-2.5 text-indigo-500" /> Team internal</>
                        ) : (
                          <><Eye className="w-2.5 h-2.5 text-emerald-500" /> Portal shared</>
                        )}
                        <span>•</span>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isAuthor && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                      title="Delete Update"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <p className="text-xs font-semibold text-zinc-750 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
