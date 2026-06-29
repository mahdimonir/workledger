'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { 
  Plus, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Trash, 
  UserPlus, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import SlideOver from '@/shared/components/SlideOver';

const COLUMNS = [
  { id: 'TODO', name: 'To Do', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
  { id: 'IN_PROGRESS', name: 'In Progress', color: 'bg-blue-50 text-blue-800 border-blue-100' },
  { id: 'IN_REVIEW', name: 'In Review', color: 'bg-amber-50 text-amber-800 border-amber-100' },
  { id: 'DONE', name: 'Done', color: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
];

export default function ProjectTasksTab() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');

  
  const [commentText, setCommentText] = useState('');

  
  const [subtaskTitle, setSubtaskTitle] = useState('');

  
  const { data: tasksRes, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => apiClient.get(`/tasks?projectId=${projectId}`).then((res) => res.data),
  });

  const { data: membersRes, isLoading: loadingMembers } = useQuery({
    queryKey: ['members'],
    queryFn: () => apiClient.get('/workspace/members').then((res) => res.data),
  });

  const { data: taskDetailsRes } = useQuery({
    queryKey: ['task', selectedTask?.id],
    queryFn: () => apiClient.get(`/tasks/${selectedTask.id}`).then((res) => res.data),
    enabled: !!selectedTask?.id,
  });

  const tasks = tasksRes?.data || [];
  const members = membersRes?.data || [];
  const taskDetails = taskDetailsRes?.data || selectedTask;

  
  const createTaskMutation = useMutation({
    mutationFn: (newTask: any) => apiClient.post('/tasks', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create task.');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.patch(`/tasks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] });
      if (selectedTask?.id === variables.id) {
        queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      }
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] });
      setIsDetailOpen(false);
      setSelectedTask(null);
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: (comment: { content: string }) => apiClient.post(`/tasks/${selectedTask.id}/comments`, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask.id] });
      setCommentText('');
    }
  });

  const createSubtaskMutation = useMutation({
    mutationFn: (subtask: { title: string; parentId: string; projectId: string }) => apiClient.post('/tasks', subtask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', selectedTask.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', { projectId }] });
      setSubtaskTitle('');
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate('');
    setAssigneeId('');
    setError('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      assigneeId: assigneeId || undefined,
      projectId,
      status: 'TODO',
    });
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createCommentMutation.mutate({ content: commentText });
  };

  const handleSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim() || !selectedTask) return;
    createSubtaskMutation.mutate({
      title: subtaskTitle,
      parentId: selectedTask.id,
      projectId,
    });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  if (loadingTasks || loadingMembers) {
    return (
      <div className="flex gap-6 overflow-x-auto min-h-[500px]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-1 min-w-[280px] bg-[#f5f2ee] rounded-2xl p-4 animate-pulse">
            <div className="h-6 w-24 bg-black/5 rounded mb-4"></div>
            <div className="h-32 bg-black/5 rounded-xl mb-4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-black text-left">
      {}
      <div className="flex justify-end">
        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="h-11 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {}
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none items-start">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t: any) => t.status === column.id && !t.parentId);
          return (
            <div 
              key={column.id} 
              className="flex-1 min-w-[300px] max-w-[350px] p-4 rounded-2xl border border-black/5 bg-[#f5f2ee]/80 flex flex-col gap-4 shadow-sm"
            >
              {}
              <div className="flex justify-between items-center px-1">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase border ${column.color}`}>
                  {column.name}
                </span>
                <span className="text-[10px] font-black text-zinc-400">
                  {columnTasks.length}
                </span>
              </div>

              {}
              <div className="flex flex-col gap-3 min-h-[300px] overflow-y-auto max-h-[500px] pr-1">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 font-bold uppercase text-[9px] border border-dashed border-black/10 rounded-xl">
                    No Tasks
                  </div>
                ) : (
                  columnTasks.map((task: any) => {
                    const assignee = members.find((m: any) => m.userId === task.assigneeId)?.user;
                    const subtasks = tasks.filter((t: any) => t.parentId === task.id);
                    const completedSubtasks = subtasks.filter((t: any) => t.status === 'DONE').length;
                    
                    return (
                      <div
                        key={task.id}
                        onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }}
                        className="p-4 rounded-xl border border-black/5 bg-white/70 backdrop-blur-md shadow-sm hover:border-black/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-2">
                          <span className={`text-[8px] px-2 py-0.2 w-fit rounded font-black uppercase ${
                            task.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                            task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            task.priority === 'MEDIUM' ? 'bg-zinc-150 text-zinc-800' : 'bg-zinc-100 text-zinc-550'
                          }`}>
                            {task.priority}
                          </span>
                          <h4 className="font-bold text-sm text-black tracking-tight">{task.title}</h4>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-black/5 text-[10px] font-bold text-zinc-400">
                          <div className="flex items-center gap-2">
                            {subtasks.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckSquare className="w-3.5 h-3.5" />
                                {completedSubtasks}/{subtasks.length}
                              </span>
                            )}
                            {task.commentsCount > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {task.commentsCount}
                              </span>
                            )}
                          </div>
                          
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {}
      <SlideOver isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Task">
        {error && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Task Title *</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement backend auth controller"
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details and deliverables"
              rows={3}
              className="p-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Priority</label>
              <select
                value={priority} onChange={(e) => setPriority(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date</label>
              <input 
                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assignee</label>
            <select
              value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/80 border border-black/10 text-sm focus:outline-none focus:border-black text-black font-bold uppercase tracking-wider"
            >
              <option value="">Select Assignee</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" disabled={createTaskMutation.isPending}
            className="h-12 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 mt-4 flex items-center justify-center cursor-pointer shadow-lg"
          >
            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </SlideOver>

      {}
      <SlideOver 
        isOpen={isDetailOpen} 
        onClose={() => { setIsDetailOpen(false); setSelectedTask(null); }} 
        title="Task Command Center"
      >
        {taskDetails && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-black/5 pb-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-black text-lg text-black tracking-tight">{taskDetails.title}</h3>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Status:{' '}
                  <select
                    value={taskDetails.status}
                    onChange={(e) => handleStatusChange(taskDetails.id, e.target.value)}
                    className="ml-1 border-none bg-transparent font-black text-black focus:outline-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(taskDetails.id)}
                className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Task"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>

            {taskDetails.description && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Description</span>
                <p className="text-xs text-zinc-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-black/5">
                  {taskDetails.description}
                </p>
              </div>
            )}

            {}
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Subtasks Checklist</span>
              <div className="flex flex-col gap-2">
                {taskDetails.subtasks?.map((sub: any) => (
                  <div key={sub.id} className="flex items-center gap-2 p-2 bg-white/40 border border-black/5 rounded-lg">
                    <input 
                      type="checkbox"
                      checked={sub.status === 'DONE'}
                      onChange={() => handleStatusChange(sub.id, sub.status === 'DONE' ? 'TODO' : 'DONE')}
                      className="w-4 h-4 rounded border-black/25 text-black focus:ring-black"
                    />
                    <span className={`text-xs font-semibold ${sub.status === 'DONE' ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubtaskSubmit} className="flex gap-2 mt-1">
                <input 
                  type="text" required value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 h-9 px-3 rounded-lg bg-white border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-bold uppercase transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {}
            <div className="flex flex-col gap-3 border-t border-black/5 pt-4">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Team Comments (internal)</span>
              
              {}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input 
                  type="text" required value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 h-9 px-3 rounded-lg bg-white border border-black/10 text-xs focus:outline-none focus:border-black text-black"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg bg-black hover:bg-zinc-800 text-[#efeae3] text-xs font-bold uppercase transition-colors"
                >
                  Send
                </button>
              </form>

              {}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {taskDetails.comments?.length === 0 ? (
                  <span className="text-[10px] text-zinc-400 font-bold uppercase py-2">No comments yet.</span>
                ) : (
                  taskDetails.comments?.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-white/40 rounded-xl border border-black/5 text-xs">
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 mb-1">
                        <span className="font-black uppercase tracking-wider">{comment.user?.name || 'User'}</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-zinc-750">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
