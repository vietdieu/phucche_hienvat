// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBookmarks } from '@/src/context/BookmarksContext';
import { BookmarkDetail } from '@/src/components/bookmark/BookmarkDetail';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { BookmarkItem } from '@/src/types';

export default function BookmarkDetailPage() {
  const params = useParams<{ id: string }>();
  const { bookmarks } = useBookmarks();
  const [bookmark, setBookmark] = useState<BookmarkItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && bookmarks.length > 0) {
      const found = bookmarks.find((b) => b.id === params.id);
      setBookmark(found || null);
      setLoading(false);
    } else if (bookmarks.length === 0 && !loading) {
      setBookmark(null);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [params.id, bookmarks, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-200 dark:bg-amber-800/50 animate-bounce" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <EmptyState
          title="Không tìm thấy di sản"
          description="Hiện vật hoặc di sản bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ khỏi bộ sưu tập."
          action={{
            label: 'Quay lại bộ sưu tập',
            href: '/my-collection',
          }}
        />
      </div>
    );
  }

  return <BookmarkDetail bookmark={bookmark} />;
}
