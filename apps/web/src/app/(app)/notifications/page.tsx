'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Bell, 
  CheckCheck, 
  AlertCircle, 
  Clock, 
  Mail, 
  DollarSign, 
  FolderKanban, 
  UserPlus, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsInboxPage() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsRes, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then((res) => res.data),
  });

  const notifications = notificationsRes?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVOICE_SENT':
      case 'INVOICE_PAID':
      case 'INVOICE_OVERDUE':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'PROPOSAL_ACCEPTED':
      case 'PROPOSAL_REJECTED':
        return <Mail className="w-4 h-4 text-indigo-600" />;
      case 'PROJECT_STAGE_CHANGED':
        return <FolderKanban className="w-4 h-4 text-amber-600" />;
      case 'MEMBER_JOINED':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-pulse text-black text-left">
        <div className="h-10 w-48 bg-black/5 rounded-lg"></div>
        <div className="h-64 bg-black/5 border border-black/5 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 text-black select-none text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Notifications Inbox</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
            Manage your alerts and workspace activity feed
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="h-11 px-5 rounded-xl border border-black/10 hover:bg-black/5 text-zinc-800 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-black/10 rounded-3xl bg-[#f5f2ee] p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-zinc-400 mb-4" />
          <h3 className="font-black text-base uppercase tracking-tight text-black mb-1">Inbox Completely Clear</h3>
          <p className="text-xs text-zinc-400 font-light max-w-xs">
            You don&apos;t have any system notifications or action items right now. Nice job!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.isRead) {
                  markReadMutation.mutate(notification.id);
                }
              }}
              className={`
                border border-black/10 rounded-2xl bg-[#f5f2ee] p-5 shadow-sm flex items-start justify-between gap-4 transition-all duration-200 cursor-pointer
                ${notification.isRead ? 'opacity-65 hover:opacity-90' : 'border-l-4 border-l-black'}
              `}
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-black/5 shadow-sm mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">
                    {notification.title || 'System Notification'}
                  </h4>
                  <p className="text-xs font-light text-zinc-600 mt-1 leading-normal">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-2.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markReadMutation.mutate(notification.id);
                  }}
                  className="text-[9px] font-black text-zinc-400 hover:text-black uppercase tracking-widest border border-black/10 hover:border-black rounded-lg px-2.5 py-1.5 bg-white transition-colors"
                >
                  Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
