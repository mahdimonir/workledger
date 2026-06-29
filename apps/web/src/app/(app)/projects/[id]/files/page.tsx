'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/store/auth.store';
import { 
  Upload, 
  Trash2, 
  Eye, 
  File, 
  Download,
  AlertCircle
} from 'lucide-react';

export default function ProjectFilesTab() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;
  const { role } = useAuthStore();
  const isManagerOrOwner = role === 'OWNER' || role === 'MANAGER';

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Queries
  const { data: filesRes, isLoading } = useQuery({
    queryKey: ['files', { projectId }],
    queryFn: () => apiClient.get(`/files/project/${projectId}`).then((res) => res.data),
  });

  const files = filesRes?.data || [];

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', { projectId }] });
    }
  });

  const toggleDeliverableMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/files/${id}/deliverable`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', { projectId }] });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // 1. Get pre-signed or local upload parameters
      const uploadUrlRes = await apiClient.post('/files/upload-url', {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        projectId,
      });

      const { uploadUrl, fileUrl, key, fields } = uploadUrlRes.data;

      // 2. Perform direct upload
      if (fields) {
        // Multipart upload (like local adapter or Cloudinary)
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
          formData.append(k, v as string);
        });
        formData.append('file', file);

        // Upload using axios without authorization header to avoid CORS or endpoint auth conflicts if requested
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload request failed.');
        }
      } else {
        // Raw PUT upload (like S3/R2 direct pre-signed URL)
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload request failed.');
        }
      }

      // 3. Register file in database
      await apiClient.post('/files/register', {
        name: file.name,
        key,
        url: fileUrl,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        projectId,
        isDeliverable: false,
      });

      // Refetch
      queryClient.invalidateQueries({ queryKey: ['files', { projectId }] });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleDeliverable = (id: string) => {
    toggleDeliverableMutation.mutate(id);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-full bg-black/5 rounded-xl"></div>
        <div className="h-32 bg-black/5 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-black text-left">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-semibold text-center">
          {error}
        </div>
      )}

      {/* File Upload Action */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-black/5 pb-4">
        <div>
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Project Assets</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Manage deliverables and assets for this project</p>
        </div>

        <label className="h-11 px-5 rounded-xl bg-black hover:bg-zinc-800 text-[#efeae3] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer shadow-md select-none">
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload File'}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Files directory list */}
      <div className="flex flex-col gap-3">
        {files.length === 0 ? (
          <div className="border border-black/5 rounded-2xl bg-white/60 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <File className="w-10 h-10 text-zinc-300 mb-4" />
            <h3 className="font-black text-md uppercase tracking-tight text-black mb-2">No Files Uploaded</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider max-w-sm">
              Upload client deliverables, assets, design specs, or contracts.
            </p>
          </div>
        ) : (
          files.map((file: any) => (
            <div 
              key={file.id} 
              className="p-4 rounded-xl border border-black/5 bg-white/60 backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-black/5 text-zinc-500">
                  <File className="w-5 h-5" />
                </span>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm text-black break-all">{file.name}</span>
                  <div className="flex gap-2 items-center text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">
                    <span>{formatBytes(file.sizeBytes)}</span>
                    <span>•</span>
                    <span>Version {file.version}</span>
                    {file.isDeliverable && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-black">
                          Deliverable
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {isManagerOrOwner && (
                  <button
                    onClick={() => handleToggleDeliverable(file.id)}
                    className={`h-9 px-3.5 rounded-lg border font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                      file.isDeliverable
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                        : 'border-black/10 hover:bg-black/5 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {file.isDeliverable ? 'Shared with Client' : 'Share with Client'}
                  </button>
                )}

                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border border-black/5 hover:bg-black/5 text-zinc-550 hover:text-black transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>

                {isManagerOrOwner && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-lg border border-black/5 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-600 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
