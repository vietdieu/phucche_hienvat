'use client';

import { 
  Building2, 
  MapPin, 
  Calendar, 
  Tag, 
  Info, 
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils';
import { motion } from 'motion/react';
import type { ArtifactInfo as ArtifactInfoType } from '@/src/services/artifactRecognitionService';

interface ArtifactInfoProps {
  artifact: ArtifactInfoType | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function ArtifactInfo({ artifact, isLoading, error, className }: ArtifactInfoProps) {
  if (isLoading) {
    return (
      <div className={cn('p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg', className)}>
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Đang phân tích hiện vật...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800', className)}>
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className={cn('p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center', className)}>
        <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Chưa có thông tin hiện vật</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Sau khi phục hồi ảnh, hệ thống sẽ tự động nhận diện
        </p>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | string[] }) => (
    <div className="flex items-start space-x-3">
      <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-mono font-bold tracking-wider text-amber-800 uppercase block mb-1">{label}</p>
        <p className="text-gray-800 dark:text-gray-200 text-sm">
          {Array.isArray(value) ? value.join(', ') : value}
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('p-6 rounded-xl bg-[#FAF7F2] dark:bg-gray-800 shadow-lg border border-amber-200/50 dark:border-gray-700', className)}
    >
      <div className="flex items-center gap-2 mb-4 border-b border-amber-200/50 pb-3">
        <Sparkles className="w-5 h-5 text-amber-600" />
        <h3 className="text-base font-mono font-bold tracking-wider text-amber-950 uppercase">Thông tin hiện vật di sản</h3>
      </div>

      <div className="space-y-5">
        {/* Tên */}
        <div>
          <h4 className="text-xl font-sans font-bold text-gray-900 dark:text-white">
            {artifact.name}
          </h4>
          <span className="inline-block mt-2 px-2.5 py-1 text-[10px] font-mono font-semibold rounded-full bg-amber-950 text-amber-200 uppercase tracking-wider">
            {artifact.category}
          </span>
        </div>

        {/* Các trường thông tin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-amber-100/55 dark:border-gray-800">
          <InfoItem icon={Building2} label="Nền văn hóa / Văn minh" value={artifact.culture} />
          <InfoItem icon={Calendar} label="Niên đại / Thời kỳ" value={artifact.era} />
          <InfoItem icon={MapPin} label="Nguồn gốc / Lưu trữ" value={artifact.location} />
          <InfoItem icon={Tag} label="Từ khóa liên quan" value={artifact.tags} />
        </div>

        {/* Mô tả */}
        <div>
          <p className="text-xs font-mono font-bold tracking-wider text-amber-800 uppercase mb-1.5">Mô tả đặc điểm</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-amber-100/55 dark:border-gray-800">
            {artifact.description}
          </p>
        </div>

        {/* Ý nghĩa */}
        <div className="p-4 bg-amber-900 text-amber-200 rounded-xl border border-amber-950">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase mb-1">Ý nghĩa & Giá trị di sản</p>
              <p className="text-sm text-amber-100 leading-relaxed">{artifact.significance}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
