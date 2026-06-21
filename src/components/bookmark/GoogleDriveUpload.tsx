'use client';

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/src/components/ui/Toaster';
import { cn } from '@/utils';

interface GoogleDriveUploadProps {
  file: Blob | null;
  fileName: string;
  onSuccess?: (fileId: string) => void;
  className?: string;
}

export function GoogleDriveUpload({ file, fileName, onSuccess, className }: GoogleDriveUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Safe login wrapper
  const handleUploadClick = () => {
    if (!clientId) {
      toast.error('Vui lòng cấu hình VITE_GOOGLE_CLIENT_ID trước khi thực hiện!');
      return;
    }
    if (!file) {
      toast.error('Không tìm thấy tệp để tải lên Google Drive');
      return;
    }
    login();
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setUploading(true);
        const accessToken = tokenResponse.access_token;

        // Metadata cho file PDF
        const metadata = {
          name: fileName,
          mimeType: 'application/pdf',
          parents: ['root'], // Lưu tại thư mục chính Google Drive
        };

        const formData = new FormData();
        formData.append(
          'metadata',
          new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        );
        formData.append('file', file as Blob);

        // Gọi Google Drive Multipart Upload API
        const response = await axios.post(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'multipart/related',
            },
          }
        );

        setUploaded(true);
        toast.success('Đã lưu thành công lên Google Drive của bạn! 📁✨');
        onSuccess?.(response.data.id);
      } catch (error) {
        console.error('Lỗi upload Google Drive:', error);
        toast.error('Không thể upload lên Google Drive. Vui lòng kiểm tra quyền hạn.');
      } finally {
        setUploading(false);
      }
    },
    onError: () => {
      toast.error('Xác thực với Google thất bại. Vui lòng thử lại.');
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  if (!clientId) {
    return (
      <div className={cn('p-3 rounded-xl bg-orange-100/50 dark:bg-orange-950/20 text-orange-950 dark:text-orange-300 text-xs flex items-start gap-2 border border-orange-200/20', className)}>
        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Tính năng lưu Google Drive chưa được cấu hình</p>
          <p className="opacity-80 leading-relaxed font-mono text-[10px]">
            Hệ thống cần giá trị VITE_GOOGLE_CLIENT_ID trong cài đặt môi trường của bạn để thực hiện xác thực an toàn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleUploadClick}
      disabled={uploading || uploaded || !file}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 w-full cursor-pointer shadow-sm',
        uploaded
          ? 'bg-emerald-100/30 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
          : !file
            ? 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 border border-slate-200/50 dark:border-gray-700 cursor-not-allowed'
            : 'bg-indigo-650 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-505 text-white active:scale-[0.98]',
        uploading && 'opacity-70 cursor-wait',
        className
      )}
    >
      {uploading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Đang tải lên Drive...
        </>
      ) : uploaded ? (
        <>
          <CheckCircle className="w-3.5 h-3.5" />
          Đã lưu vào G Drive
        </>
      ) : (
        <>
          <UploadCloud className="w-3.5 h-3.5" />
          Lưu trữ Google Drive
        </>
      )}
    </button>
  );
}
