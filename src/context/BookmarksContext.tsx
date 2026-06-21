'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BookmarkItem } from '@/src/types';

interface BookmarksContextType {
  bookmarks: BookmarkItem[];
  addBookmark: (item: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (item: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
  updateBookmarkNote: (id: string, note: string) => void;
  updateBookmarkReminder: (id: string, reminder: BookmarkItem['reminder']) => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const STORAGE_KEY = 'culturalvault_bookmarks';

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  {
    id: "bm_seed_trong_dong",
    title: "Trống Đồng Đông Sơn",
    description: "Trống đồng Đông Sơn cổ đại tiêu biểu cho Việt Nam, biểu trưng cho quyền lực thời kỳ nhà nước Hùng Vương và tài hoa đúc đồng Thượng cổ.",
    imageUrl: "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/ea/Dong_Son_drum_glenbow-2.jpg",
    category: "Cổ vật đồng",
    rating: 5,
    year: -500,
    location: "Văn hóa Đông Sơn, Bắc Bộ",
    tags: ["Trống Đồng", "Đông Sơn", "Bảo Vật Quốc Gia"],
    isAIRestored: true,
    restoredImage: "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/ea/Dong_Son_drum_glenbow-2.jpg",
    recognition: {
      objectName: "Trống Đồng Đông Sơn (Ngọc Lũ)",
      culture: "Văn hóa Đông Sơn",
      period: "Thế kỷ V - I trước công nguyên",
      description: "Có hình dáng hài hòa, mặt trống chạm khắc hoa văn hình ngôi sao nhiều cánh, chim Lạc bay, và hoạt cảnh đời sống sinh hoạt phong phú.",
      confidence: 0.99
    },
    note: "Demo mốc di sản quốc gia. Bạn có thể xóa hoặc sửa ghi chú này.",
    createdAt: new Date().toISOString()
  }
];

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Load từ localStorage khi mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Di chuyển tự động sang URL thông qua máy chủ đệm ảnh miễn phí của Cloudflare để tránh lỗi CORS/Hotlinking từ Wikipedia
          const migrated = parsed.map(item => {
            let updated = { ...item };
            if (item.imageUrl === "https://upload.wikimedia.org/wikipedia/commons/e/ea/Dong_Son_drum_glenbow-2.jpg") {
              updated.imageUrl = "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/ea/Dong_Son_drum_glenbow-2.jpg";
            }
            if (item.restoredImage === "https://upload.wikimedia.org/wikipedia/commons/e/ea/Dong_Son_drum_glenbow-2.jpg") {
              updated.restoredImage = "https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/ea/Dong_Son_drum_glenbow-2.jpg";
            }
            return updated;
          });
          setBookmarks(migrated);
        } else {
          setBookmarks(DEFAULT_BOOKMARKS);
        }
      } catch {
        setBookmarks(DEFAULT_BOOKMARKS);
      }
    } else {
      setBookmarks(DEFAULT_BOOKMARKS);
    }
  }, []);

  // Lưu vào localStorage mỗi khi bookmarks thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback((item: Omit<BookmarkItem, 'id' | 'createdAt'>) => {
    const newItem: BookmarkItem = {
      ...item,
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [...prev, newItem]);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some((b) => b.title === id || b.id === id);
  }, [bookmarks]);

  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'id' | 'createdAt'>) => {
    // Kiểm tra xem có bookmark nào trùng title và imageUrl không
    const existing = bookmarks.find(
      (b) => b.title === item.title && b.imageUrl === item.imageUrl
    );
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(item);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  const updateBookmarkNote = useCallback((id: string, note: string) => {
    setBookmarks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, note } : item
      )
    );
  }, []);

  const updateBookmarkReminder = useCallback((id: string, reminder: BookmarkItem['reminder']) => {
    setBookmarks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, reminder } : item
      )
    );
  }, []);

  return (
    <BookmarksContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark, updateBookmarkNote, updateBookmarkReminder }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
