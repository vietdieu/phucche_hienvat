// @ts-nocheck
import { ImageRestorer } from '@/src/components/ai/ImageRestorer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phục hồi ảnh di sản - CulturalVault',
  description: 'Sử dụng AI để phục hồi và làm đẹp ảnh cũ về di sản văn hóa',
};

export default function RestorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
      <ImageRestorer />
    </div>
  );
}
