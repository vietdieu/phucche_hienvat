'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { BookmarkItem } from '../../types';
import { BatchPDFDocument } from './BatchPDFDocument';
import { PDFTemplate, templates } from './PDFTemplates';
import { GoogleDriveUpload } from './GoogleDriveUpload';
import { FileDown, Loader2, Eye, X, Check, CloudLightning, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '../../../utils';
import { toast } from '../ui/Toaster';

interface BatchExportPDFButtonProps {
  bookmarks: BookmarkItem[];
  className?: string;
  onCloseSelector?: () => void;
}

export function BatchExportPDFButton({ bookmarks, className, onCloseSelector }: BatchExportPDFButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [template, setTemplate] = useState<PDFTemplate>('modern');
  const [reportTitle, setReportTitle] = useState('Báo Cáo Sưu Tập Di Sản Văn Hóa');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Clear PDF blob cache on template/title layout changes
  useEffect(() => {
    setPdfBlob(null);
  }, [template, reportTitle]);

  if (!bookmarks || bookmarks.length === 0) {
    return null;
  }

  const defaultFileName = `CulturalVault_Bao_Cao_${template}_${new Date().toISOString().slice(0, 10)}.pdf`;

  const pdfDocument = React.useMemo(() => (
    <BatchPDFDocument bookmarks={bookmarks} template={template} reportTitle={reportTitle} />
  ), [bookmarks, template, reportTitle]);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* 1. Trực tiếp xuất nhanh PDF */}
      <PDFDownloadLink
        document={pdfDocument}
        fileName={defaultFileName}
      >
        {({ blob, loading }) => {
          if (blob && pdfBlob !== blob) {
            setPdfBlob(blob);
          }
          return (
            <button
              type="button"
              disabled={loading}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer select-none border active:scale-95',
                loading
                  ? 'bg-amber-100/60 dark:bg-amber-950/20 text-amber-700 border-amber-200/20 cursor-wait'
                  : 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-900 hover:shadow-amber-950/20'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang xử lý {bookmarks.length} mục...
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  Xuất nhanh {bookmarks.length} hiện vật
                </>
              )}
            </button>
          );
        }}
      </PDFDownloadLink>

      {/* 2. Visual Previewer & layout customizer modal */}
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-amber-200/40 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-[#FAF7F2] dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 shadow-sm cursor-pointer select-none active:scale-95"
      >
        <Eye className="w-3.5 h-3.5 text-amber-600" />
        Thiết kế & Xem trước
      </button>

      {/* Modern responsive Design and Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FAF9F5] dark:bg-gray-900 rounded-3xl max-w-5xl w-full h-[90vh] border border-amber-100/20 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-150/30 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
                  <BookOpen className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950 dark:text-white">Studio biên tập & xuất báo cáo PDF</h3>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-semibold font-mono uppercase tracking-wider text-amber-800">
                    CulturalVault Workshop • Đang thiết kế {bookmarks.length} hiện vật tuyển chọn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Columns (Split Design Settings on Left, Interactive WebGL/Canvas/PDF Page Preview on Right) */}
            <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-amber-150/20 dark:divide-gray-800 overflow-hidden">
              
              {/* Left Column: Configurations */}
              <div className="w-full lg:w-[35%] p-6 overflow-y-auto space-y-6 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm">
                
                {/* Section 1: Title Input */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-amber-900 dark:text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    1. Tiêu đề báo cáo di sản
                  </h4>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Nhập tiêu đề báo cáo..."
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-amber-200/50 dark:border-gray-700 bg-white dark:bg-gray-950 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-transparent transition-all"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-gray-400">
                    Tiêu đề gõ bằng tiếng Việt sẽ tự động canh đều và nổi bật trên trang bìa (khổ A4 dọc).
                  </p>
                </div>

                {/* Section 2: Choose Template */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-amber-900 dark:text-amber-400 flex items-center gap-2">
                    <CloudLightning className="w-3.5 h-3.5 text-amber-500" />
                    2. Chọn mẫu thiết kế tài liệu
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id)}
                        className={cn(
                          'p-4 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer flex items-start gap-3 bg/white dark:bg-gray-950',
                          template === t.id
                            ? 'border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 shadow-md scale-[1.01]'
                            : 'border-amber-100/20 dark:border-gray-800 hover:border-amber-400 dark:hover:border-gray-650'
                        )}
                      >
                        <span className="text-2xl pt-1">{t.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-amber-950 dark:text-white flex items-center gap-1.5">
                            {t.label}
                            {template === t.id && (
                              <Check className="w-3.5 h-3.5 text-amber-700" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                            {t.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 3: Downloads & Clouds syncs */}
                <div className="space-y-4 pt-4 border-t border-amber-100/20">
                  <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-amber-900 dark:text-amber-400">
                    3. Xuất bản & Lưu trữ
                  </h4>

                  <div className="space-y-2">
                    <PDFDownloadLink
                      document={pdfDocument}
                      fileName={defaultFileName}
                    >
                      {({ blob, loading }) => {
                        if (blob && pdfBlob !== blob) {
                          setPdfBlob(blob);
                        }
                        return (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              toast.success('Đã tiến hành tải xuống tệp PDF báo cáo!');
                            }}
                            className={cn(
                              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold uppercase transition-all duration-300 shadow-md cursor-pointer select-none text-white',
                              loading
                                ? 'bg-amber-100 text-amber-500 dark:bg-amber-950/10 cursor-wait'
                                : 'bg-amber-600 hover:bg-amber-700'
                            )}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang đóng gói dữ liệu...
                              </>
                            ) : (
                              <>
                                <FileDown className="w-4 h-4" />
                                Tải xuống báo cáo PDF
                              </>
                            )}
                          </button>
                        );
                      }}
                    </PDFDownloadLink>

                    {pdfBlob && (
                      <div className="pt-1">
                        <GoogleDriveUpload
                          file={pdfBlob}
                          fileName={defaultFileName}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Web live document Preview */}
              <div className="flex-1 bg-[#1E293B] relative flex flex-col justify-center items-center p-4">
                <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Màn hình xem trước ấn phẩm (A4)
                </div>
                
                <div className="w-full h-full pt-10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                  <PDFViewer width="100%" height="100%" showToolbar={true} className="rounded-2xl border border-slate-700">
                    {pdfDocument}
                  </PDFViewer>
                </div>
              </div>

            </div>

            {/* Footer summary metrics */}
            <div className="bg-white dark:bg-gray-950 px-6 py-4.5 border-t border-amber-150/20 dark:border-gray-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-gray-400">
                Toàn bộ dữ liệu bản địa bao gồm hình vẽ và định dạng chữ viết đều tuân thủ nguyên tắc bảo mật.
              </span>
              <p className="font-mono text-[10px] text-amber-800 dark:text-amber-500 uppercase tracking-widest font-bold">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
