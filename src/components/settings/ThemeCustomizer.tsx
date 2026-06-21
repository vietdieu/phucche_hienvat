'use client';

import React from 'react';
import { useThemePreferences, type Density, type FontPair } from '@/src/context/ThemePreferencesContext';
import { useTheme } from '@/src/context/ThemeContext';
import { COLOR_THEMES, LAYOUT_OPTIONS, type ColorTheme, type LayoutMode } from '@/src/theme/config';
import { cn } from '@/utils';
import { Check, Palette, Type, Layout, RefreshCw, Sparkles, Grid, Layers, AlignJustify } from 'lucide-react';

const colorThemesList: { value: ColorTheme; label: string; bg: string; text: string }[] = [
  { value: 'amber', label: 'Hổ phách (Amber)', bg: 'bg-amber-600', text: 'text-amber-800' },
  { value: 'blue', label: 'Xanh dương (Blue)', bg: 'bg-blue-600', text: 'text-blue-800' },
  { value: 'green', label: 'Xanh lá (Green)', bg: 'bg-green-600', text: 'text-green-850' },
  { value: 'purple', label: 'Tím vương giả (Purple)', bg: 'bg-purple-600', text: 'text-purple-800' },
  { value: 'pink', label: 'Hồng quý phái (Pink)', bg: 'bg-pink-600', text: 'text-pink-800' },
  { value: 'rose', label: 'Đỏ hồng (Rose)', bg: 'bg-rose-600', text: 'text-rose-800' },
];

const densities: { value: Density; label: string; icon: string; desc: string }[] = [
  { value: 'compact', label: 'Gọn gàng', icon: '🔍', desc: 'Tối ưu cho màn hình nhỏ và bảng khảo cứu dày' },
  { value: 'comfortable', label: 'Thoải mái', icon: '📖', desc: 'Bố cục chuẩn mực, dễ đọc và nghiên cứu' },
  { value: 'spacious', label: 'Rộng rãi', icon: '🖼️', desc: 'Rộng thoáng, làm nổi bật chi tiết hình ảnh phục chế' },
];

const fontPairs: { value: FontPair; label: string; heading: string; body: string; desc: string }[] = [
  { value: 'classic', label: 'Đông Dương Cổ Kính', heading: 'Space Grotesk & Playfair', body: 'Inter', desc: 'Hơi thở báo chí, tư liệu bảo tàng thế kỷ 20' },
  { value: 'modern', label: 'Công Nghệ Sang Trọng', heading: 'Inter Bold', body: 'Inter', desc: 'Giao diện phẳng, tinh xảo tuyệt đối' },
  { value: 'minimal', label: 'Học Thuật Tối Giản', heading: 'JetBrains Mono', body: 'System UI', desc: 'Tập trung sâu sắc vào con chữ nghiên cứu cổ thư' },
  { value: 'playful', label: 'Mỹ Thuật Phóng Khoáng', heading: 'Space Grotesk', body: 'Inter', desc: 'Tạo cảm hứng khơi nguồn nghệ thuật di sản' },
];

export function ThemeCustomizer() {
  const { preferences, updatePreferences, resetPreferences } = useThemePreferences();
  const { colorTheme, layout, setColorTheme, setLayout } = useTheme();

  const handleColorChange = (value: ColorTheme) => {
    setColorTheme(value);
    // Sync with previous preferences framework for secondary layouts
    const legacySchemeMap: Record<ColorTheme, any> = {
      amber: 'amber',
      blue: 'blue',
      green: 'emerald',
      purple: 'violet',
      pink: 'rose', // fallback
      rose: 'rose',
    };
    updatePreferences({ colorScheme: legacySchemeMap[value] || 'amber' });
  };

  const handleResetAll = () => {
    resetPreferences();
    setColorTheme('amber');
    setLayout('grid');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Chọn màu sắc chủ đạo (Accent Color) */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5 font-bold">
          <Palette className="w-3.5 h-3.5 text-primary" />
          Màu sắc chủ đạo (Primary Theme Color)
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-gray-400 leading-relaxed">
          Được áp dụng tức thì cho các nút điều hướng bấm chọn, tiêu đề hào quang và bộ lọc chính.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {colorThemesList.map((scheme) => {
            const isSelected = colorTheme === scheme.value;
            return (
              <button
                key={scheme.value}
                type="button"
                onClick={() => handleColorChange(scheme.value)}
                className={cn(
                  'flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left cursor-pointer bg-slate-50/60 dark:bg-slate-800/40 hover:scale-[1.01]',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'border-slate-205 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700'
                )}
              >
                <span className={cn('w-4 h-4 rounded-full shrink-0 shadow-xs border border-white/25', scheme.bg)} />
                <span className="text-xs font-semibold text-slate-805 dark:text-gray-200 truncate">{scheme.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chọn kiểu bố cục (Layout Mode) */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5 font-bold">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Kiểu bố cục danh mục (Catalog Layout Mode)
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-gray-400 leading-relaxed">
          Tùy biến hiển thị danh mục hiện vật theo kiểu Lưới trực quan, Danh sách dọc, Gọn nhẹ, Dòng thời gian lịch sử, hoặc Mosaics/Masonry so le.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {LAYOUT_OPTIONS.map((item) => {
            const isSelected = layout === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setLayout(item.value)}
                className={cn(
                  'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 hover:scale-[1.02] bg-slate-50/65 dark:bg-slate-800/40 relative',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-bold'
                    : 'border-slate-205 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-750'
                )}
              >
                <span className="text-xl leading-none text-primary">{item.icon}</span>
                <span className="text-[10.5px] text-slate-800 dark:text-gray-200 leading-none truncate w-full">{item.label}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-xs">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Mật độ khoảng cách hiển thị (Density) */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5 font-bold">
          <Layout className="w-3.5 h-3.5 text-primary" />
          Mật độ khoảng cách hiển thị (Container Spacing)
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-gray-400 leading-relaxed">
          Tăng giảm độ nén khoảng cách các dòng, lề trang khảo cứu giúp hiển thị dữ liệu tinh gọn nhất.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {densities.map((item) => {
            const isSelected = preferences.density === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => updatePreferences({ density: item.value })}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 hover:scale-[1.01] bg-slate-50/65 dark:bg-slate-800/40',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                    : 'border-slate-205 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-750'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-800 dark:text-gray-100">
                    {item.icon} {item.label}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-primary" />}
                </div>
                <span className="text-[9.5px] text-slate-400 leading-normal">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tổ hợp phông chữ cổ xưa (Font Pairings) */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5 font-bold">
          <Type className="w-3.5 h-3.5 text-primary" />
          Cặp phông chữ trưng bày học thuật
        </h3>
        <p className="text-[11px] text-slate-400 dark:text-gray-400 leading-relaxed">
          Lựa chọn phông chữ mang đậm nét cổ xưa Đông Dương nguyên bản hoặc phông chữ khoa học thẳng thớm dễ đọc.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {fontPairs.map((pair) => {
            const isSelected = preferences.fontPair === pair.value;
            return (
              <button
                key={pair.value}
                type="button"
                onClick={() => updatePreferences({ fontPair: pair.value })}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 hover:scale-[1.01] bg-slate-50/65 dark:bg-slate-800/40',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                    : 'border-slate-205 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-750'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-850 dark:text-white">{pair.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-primary" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  {pair.heading} + {pair.body}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 italic">{pair.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Preview Section */}
      <div className="p-4 rounded-2xl bg-[#F7F4F0] dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-105 dark:bg-amber-950/70 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-300 font-bold">
          <Sparkles className="w-2.5 h-2.5 shrink-0 animate-pulse text-amber-600" />
          Xem Trước Trực Tiếp
        </div>
        <p className="text-[10px] font-mono tracking-wider text-slate-400 mb-1.5">Giao diện mẫu áp dụng cấu hình đã chọn:</p>
        
        <div className="space-y-1">
          <h4 
            style={{ fontFamily: fontPairs.find(p => p.value === preferences.fontPair)?.heading || 'Space Grotesk' }}
            className={cn(
              "font-semibold text-slate-900 dark:text-white transition-all text-sm",
              preferences.density === 'compact' ? 'py-0.5' : preferences.density === 'spacious' ? 'py-1.5 text-base' : 'py-1'
            )}
          >
            🏛️ Trưng Bày Đàn Nguyệt Cổ Nhà Lý
          </h4>
          <p 
            style={{ fontFamily: fontPairs.find(p => p.value === preferences.fontPair)?.body || 'Inter' }}
            className={cn(
              "text-xs text-slate-600 dark:text-slate-300 leading-relaxed",
              preferences.density === 'compact' ? 'text-[11px] leading-tight' : preferences.density === 'spacious' ? 'text-sm leading-loose' : 'text-xs'
            )}
          >
            Nhạc khí cổ phục chế tinh xảo bằng AI phục hồi độ sâu màu sắc vân gỗ quý hiếm. Hãy khám phá và lưu giữ nghiên cứu khoa tàng di vật...
          </p>
        </div>
      </div>

      {/* Reset button */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-gray-800 pt-4 mt-3">
        <button
          type="button"
          onClick={handleResetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-mono hover:bg-slate-150 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-gray-800"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          Khôi Phục Giao Diện Mặc Định
        </button>
      </div>

    </div>
  );
}
