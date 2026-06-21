'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '../../../utils';
import { toast } from '../ui/Toaster';

interface ExportChartImageProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  className?: string;
}

export function ExportChartImage({ chartRef, filename = 'chart', className }: ExportChartImageProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!chartRef.current) {
      toast.error('Không tìm thấy biểu đồ hợp lệ để xuất');
      return;
    }

    setIsExporting(true);
    
    // Lưu lại getComputedStyle nguyên bản
    const originalHostGetComputedStyle = window.getComputedStyle;

    const sanitizeCSSColor = (val: any): any => {
      if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
        // Thay thế oklch(...) và oklab(...) thành các mã màu thông dụng hợp lệ với html2canvas
        // Hầu hếu là màu xám trung tính hoặc trong suốt để giữ giao diện đẹp, sạch sẽ
        return val
          .replace(/oklch\([^)]+\)/g, '#94a3b8')
          .replace(/oklab\([^)]+\)/g, '#94a3b8');
      }
      return val;
    };

    // Tạo proxy bọc CSSStyleDeclaration để tự động lọc và dịch ngược màu sắc không được hỗ trợ
    const createStyleProxy = (style: CSSStyleDeclaration) => {
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              return sanitizeCSSColor(val);
            };
          }
          
          const value = Reflect.get(target, prop);
          if (typeof value === 'string') {
            return sanitizeCSSColor(value);
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      });
    };

    try {
      // Xác định xem có đang ở chế độ dark mode không để điều chỉnh background phù hợp
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                          document.body.classList.contains('dark') ||
                          chartRef.current.closest('.dark') !== null;

      // Override tạm thời getComputedStyle của host window
      window.getComputedStyle = function(element, pseudoElt) {
        const style = originalHostGetComputedStyle.call(window, element, pseudoElt);
        if (!style) return style;
        return createStyleProxy(style);
      };
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: isDarkMode ? '#111827' : '#faf7f2', // Sử dụng đúng màu nền của hệ thống
        scale: 2, // Xuất chất lượng cao (Retina)
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Thực hiện điều chỉnh nhỏ cho tài liệu nhân bản nếu cần
          const clonedEl = clonedDoc.getElementById(chartRef.current?.id || '') as HTMLElement;
          if (clonedEl) {
            clonedEl.style.padding = '24px';
          }

          // Override getComputedStyle của tài liệu nhân bản (iframe window)
          const defaultView = clonedDoc.defaultView || window;
          const originalClonedGetComputedStyle = defaultView.getComputedStyle;
          
          defaultView.getComputedStyle = function(element, pseudoElt) {
            const style = originalClonedGetComputedStyle.call(defaultView, element, pseudoElt);
            if (!style) return style;
            return createStyleProxy(style);
          };
        }
      });
      
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Đã tải xuống ảnh biểu đồ chất lượng cao!');
    } catch (error) {
      console.error('Lỗi khi xuất biểu đồ:', error);
      toast.error('Không thể xuất ảnh biểu đồ');
    } finally {
      // Khôi phục lại hàm getComputedStyle nguyên bản
      window.getComputedStyle = originalHostGetComputedStyle;
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-sm select-none',
        'bg-amber-50/50 hover:bg-amber-100/80 dark:bg-gray-800 dark:hover:bg-gray-750 text-amber-900 border-amber-200/40 dark:border-gray-700 dark:text-amber-400',
        isExporting && 'opacity-70 cursor-wait',
        className
      )}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Đang xuất...</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>Tải ảnh</span>
        </>
      )}
    </button>
  );
}
