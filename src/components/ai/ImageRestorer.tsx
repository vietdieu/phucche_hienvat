'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DropZone } from './DropZone';
import { ImagePreview } from './ImagePreview';
import { RestoreControls } from './RestoreControls';
import { ArtifactInfo } from './ArtifactInfo';
import { SaveResultButton } from './SaveResultButton';
import { useImageUpload } from '@/src/hooks/useImageUpload';
import { restoreImage, type RestoreResult } from '@/src/services/imageRestoreService';
import { recognizeArtifact, type ArtifactInfo as ArtifactInfoType } from '@/src/services/artifactRecognitionService';
import { toast } from '@/src/components/ui/Toaster';
import { cn } from '@/utils';

export function ImageRestorer() {
  const {
    preview,
    base64,
    error: uploadError,
    isLoading: isUploading,
    handleFile,
    reset,
  } = useImageUpload();

  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States cho nhận diện hiện vật
  const [artifact, setArtifact] = useState<ArtifactInfoType | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const handleRestore = async () => {
    if (!base64) {
      toast.error('Vui lòng tải lên ảnh trước');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setArtifact(null);
    setRecognitionError(null);

    try {
      const result: RestoreResult = await restoreImage(base64, {
        outputFormat: 'png',
      });

      if (result.success) {
        setRestoredImage(result.restoredImage);
        toast.success('Phục hồi ảnh thành công!');

        // Nhận diện hiện vật tự động sau khi khôi phục ảnh thành công
        setIsRecognizing(true);
        try {
          const recoResult = await recognizeArtifact(base64);
          if (recoResult.success && recoResult.artifact) {
            setArtifact(recoResult.artifact);
            toast.info('Nhận diện hiện vật thành công!');
          } else {
            setRecognitionError(recoResult.error || 'Không thể nhận diện hiện vật di sản');
          }
        } catch (recoErr) {
          const msg = recoErr instanceof Error ? recoErr.message : 'Có lỗi xảy ra khi nhận diện';
          setRecognitionError(msg);
        } finally {
          setIsRecognizing(false);
        }

      } else {
        setError(result.error || 'Có lỗi xảy ra');
        toast.error(result.error || 'Lỗi phục hồi ảnh');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    reset();
    setRestoredImage(null);
    setArtifact(null);
    setError(null);
    setRecognitionError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-8">
      {/* Tiêu đề */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          Phục hồi ảnh di sản
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Tải lên ảnh cũ của bạn và để AI khôi phục lại nét đẹp nguyên bản
        </p>
      </div>

      {/* Bước 1: Upload */}
      {!preview && !restoredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DropZone
            onFileSelect={handleFile}
            isLoading={isUploading}
            error={uploadError}
          />
        </motion.div>
      )}

      {/* Bước 2: Hiển thị ảnh gốc và kết quả */}
      {(preview || restoredImage) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Ảnh gốc */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Ảnh gốc
            </h3>
            <ImagePreview
              src={preview}
              alt="Ảnh gốc"
              className="h-64 md:h-80"
            />
          </div>

          {/* Ảnh đã phục hồi */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Ảnh đã phục hồi
            </h3>
            <ImagePreview
              src={restoredImage || preview}
              alt="Ảnh đã phục hồi"
              isLoading={isProcessing}
              className="h-64 md:h-80"
            />
          </div>
        </motion.div>
      )}

      {/* Bước 3: Điều khiển */}
      <AnimatePresence>
        {(preview || restoredImage) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          >
            <RestoreControls
              onRestore={handleRestore}
              isProcessing={isProcessing}
              hasImage={!!preview && !restoredImage}
              disabled={isUploading}
              className="flex-1"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                Tải lại
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hiển thị thông tin hiện vật */}
      {(restoredImage || artifact || isRecognizing) && (
        <div className="space-y-4">
          <ArtifactInfo
            artifact={artifact}
            isLoading={isRecognizing}
            error={recognitionError}
            className="mt-6"
          />
          {artifact && preview && (
            <div className="flex justify-end p-2 bg-[#FAF7F2] dark:bg-gray-800 rounded-xl border border-amber-200/50 dark:border-gray-700">
              <SaveResultButton
                originalImage={preview}
                restoredImage={restoredImage || preview}
                recognition={{
                  objectName: artifact.name,
                  culture: artifact.culture,
                  period: artifact.era,
                  description: artifact.description,
                  confidence: 0.95,
                  tags: artifact.tags,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Hiển thị lỗi */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Thông tin thêm */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
        <p>Mô hình AI sử dụng: flux-kontext-apps/restore-image</p>
        <p>Thời gian xử lý có thể mất vài giây. Vui lòng không đóng trang.</p>
      </div>
    </div>
  );
}
