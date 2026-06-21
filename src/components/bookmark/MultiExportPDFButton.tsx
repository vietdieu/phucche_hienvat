'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookmarkItem } from '@/src/types';
import { MultiPDFDocument } from './MultiPDFDocument';
import { TemplateSelector } from './TemplateSelector';
import { PDFTemplate } from './PDFTemplates';
import { GoogleDriveUpload } from './GoogleDriveUpload';
import { FileDown, X, Library, Sparkles, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface MultiExportPDFButtonProps {
  bookmarks: BookmarkItem[];
  className?: string;
}

export function MultiExportPDFButton({ bookmarks, className }: MultiExportPDFButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [template, setTemplate] = useState<PDFTemplate>('modern');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Memoize MultiPDFDocument structure to avoid redundant renders
  const pdfDocument = React.useMemo(() => (
    <MultiPDFDocument bookmarks={bookmarks} template={template} />
  ), [bookmarks, template]);

  // Clear PDF blob cache on template layout changes
  useEffect(() => {
    setPdfBlob(null);
  }, [template]);

  if (!bookmarks || bookmarks.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 text-xs tracking-wider uppercase',
          'bg-amber-950 hover:bg-amber-900 text-amber-200 shadow-md border border-amber-900/35 cursor-pointer active:scale-95 hover:shadow-amber-900/10',
          className
        )}
      >
        <FileDown className="w-4 h-4 text-amber-300 animate-bounce" />
        Xuất Sưu Tập ({bookmarks.length})
      </button>

      {/* Bespoke Responsive Backdrop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full border border-amber-100/20 shadow-2xl overflow-hidden flex flex-col p-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-50/50 dark:border-gray-850 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
                  <Library className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Xuất trọn bộ sưu tập di sản</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Xuất tất cả {bookmarks.length} hiện vật khảo cứu thành một tệp PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 flex-1">
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed bg-amber-50/10 dark:bg-gray-950/20 p-3 rounded-xl border border-amber-100/10">
                Toàn bộ các hiện vật lưu trữ, hình ảnh phục chế chất lượng cao, các phân tích dực lượng của AI, lịch nhắc và ghi chú cá nhân của từng hiện vật sẽ được đóng gói thành từng trang riêng biệt trong tập tài liệu kỷ yếu khảo cứu này.
              </p>

              {/* Step 1: choosing templates */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-905 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Bước 1: Chọn mẫu thiết kế tài liệu
                </span>
                <TemplateSelector selected={template} onSelect={setTemplate} />
              </div>

              {/* Step 2: exporting & uploading */}
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-905 dark:text-amber-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  Bước 2: Phát hành và lưu trữ thông tin
                </span>

                <div className="bg-amber-50/30 dark:bg-gray-950/40 p-4 rounded-xl border border-amber-200/10 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">CulturalVault_Portfolio_{bookmarks.length}_Items.pdf</h4>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 uppercase font-mono font-bold tracking-wider">
                      Trọn bộ sưu tập • Giao diện {template}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <PDFDownloadLink
                      document={pdfDocument}
                      fileName={`CulturalVault_Sưu_Tập_${template}_${new Date().toISOString().slice(0, 10)}.pdf`}
                    >
                      {({ blob, loading }) => {
                        // Dynamically update state blob once calculated
                        if (blob && pdfBlob !== blob) {
                          setPdfBlob(blob);
                        }
                        return (
                          <button
                            type="button"
                            disabled={loading}
                            className={cn(
                              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-white shadow-sm transition-all duration-300',
                              loading
                                ? 'bg-amber-200 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 cursor-wait'
                                : 'bg-amber-950 hover:bg-amber-900 active:scale-[0.98]'
                            )}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-750" />
                                Đang tổng hợp dữ liệu...
                              </>
                            ) : (
                              <>
                                <FileDown className="w-3.5 h-3.5" />
                                Tải xuống báo cáo tổng hợp
                              </>
                            )}
                          </button>
                        );
                      }}
                    </PDFDownloadLink>

                    {pdfBlob && (
                      <GoogleDriveUpload
                        file={pdfBlob}
                        fileName={`CulturalVault_Sưu_Tập_${template}_${new Date().toISOString().slice(0, 10)}.pdf`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Note text */}
            <div className="text-[9.5px] text-slate-400 dark:text-gray-500 font-mono text-center mt-5 pt-3 border-t border-slate-100 dark:border-gray-850">
              Định dạng tối ưu hóa in ấn khổ A4 ngang/dọc, tự động canh chỉnh ảnh và lề văn bản.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
