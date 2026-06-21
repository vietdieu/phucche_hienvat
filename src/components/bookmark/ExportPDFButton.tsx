'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BookmarkItem } from '@/src/types';
import { PDFTemplate } from './PDFTemplates';
import { TemplateSelector } from './TemplateSelector';
import { PDFDocument } from './PDFDocument';
import { GoogleDriveUpload } from './GoogleDriveUpload';
import { FileDown, X, FileText, Sparkles, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface ExportPDFButtonProps {
  bookmark: BookmarkItem;
  className?: string;
}

export function ExportPDFButton({ bookmark, className }: ExportPDFButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>('modern');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Memoize PDF document structure for ultra high rendering performance
  const pdfDocument = React.useMemo(() => (
    <PDFDocument bookmark={bookmark} template={selectedTemplate} />
  ), [bookmark, selectedTemplate]);

  // Reset PDF blob caching when template changes
  useEffect(() => {
    setPdfBlob(null);
  }, [selectedTemplate]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={cn(
          'flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-950 text-amber-200 hover:bg-amber-900 transition-all font-semibold cursor-pointer border border-amber-900/30 text-xs shadow-sm',
          className
        )}
      >
        <FileDown className="w-3.5 h-3.5 text-amber-300" />
        Xuất PDF Báo Cáo
      </button>

      {/* Stunning Backdrop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full border border-amber-200/20 shadow-2xl overflow-hidden flex flex-col p-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-50/50 dark:border-gray-850 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
                  <FileText className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Xuất báo cáo di sản PDF</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Lựa chọn phong cách và phương thức lưu trữ</p>
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

            {/* Modal Content */}
            <div className="space-y-4 flex-1">
              {/* Template Section */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-905 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Bước 1: Chọn giao diện trình bày
                </span>
                <TemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} />
              </div>

              {/* Status Section and Link */}
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-905 dark:text-amber-200 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  Bước 2: Tải xuống hoặc lưu trữ mây
                </span>

                <div className="bg-amber-50/30 dark:bg-gray-950/40 p-4 rounded-xl border border-amber-200/10 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{bookmark.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 uppercase font-mono font-bold tracking-wider">{selectedTemplate} Layout Edition</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <PDFDownloadLink
                      document={pdfDocument}
                      fileName={`${bookmark.title.replace(/\s+/g, '_')}_CulturalVault_${selectedTemplate}.pdf`}
                    >
                      {({ blob, loading }) => {
                        // Dynamically cache blob for Google Drive Upload once loaded
                        if (blob && pdfBlob !== blob) {
                          setPdfBlob(blob);
                        }
                        return (
                          <button
                            type="button"
                            disabled={loading}
                            className={cn(
                              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold select-none cursor-pointer text-white shadow-sm transition-all duration-350',
                              loading
                                ? 'bg-amber-200 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 cursor-wait'
                                : 'bg-amber-800 hover:bg-amber-700 active:scale-[0.98]'
                            )}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                                Đang vẽ PDF...
                              </>
                            ) : (
                              <>
                                <FileDown className="w-3.5 h-3.5" />
                                Tải PDF Xuống máy
                              </>
                            )}
                          </button>
                        );
                      }}
                    </PDFDownloadLink>

                    {pdfBlob && (
                      <GoogleDriveUpload
                        file={pdfBlob}
                        fileName={`${bookmark.title.replace(/\s+/g, '_')}_CulturalVault_${selectedTemplate}.pdf`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Note text */}
            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono text-center mt-5 pt-3 border-t border-slate-100 dark:border-gray-850">
              PDF bao gồm Mô tả, Thẻ phân loại, Kết quả giám định AI, Lịch nhắc và Ghi chú.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
