'use client';

import React from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  src: string | null;
  alt?: string;
  title?: string;
  isLoading?: boolean;
  className?: string;
  onLoad?: () => void;
}

export function ImagePreview({
  src,
  alt = 'Preview',
  title,
  isLoading = false,
  className,
  onLoad,
}: ImagePreviewProps) {
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  React.useEffect(() => {
    if (src) setIsImageLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsImageLoading(false);
    onLoad?.();
  };

  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800', className)}>
      {!src ? (
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-600">
          <span className="text-sm">Chưa có ảnh</span>
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            width={800}
            height={600}
            referrerPolicy="no-referrer"
            className={cn(
              'w-full h-auto object-contain transition-opacity duration-300',
              (isLoading || isImageLoading) ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={handleLoad}
          />
          {(isLoading || isImageLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700/50">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          )}
        </>
      )}

      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white font-medium text-sm">{title}</p>
        </div>
      )}
    </div>
  );
}
