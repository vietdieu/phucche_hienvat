export type ColorTheme = 'amber' | 'blue' | 'green' | 'purple' | 'pink' | 'rose';
export type LayoutMode = 'grid' | 'list' | 'compact' | 'timeline' | 'masonry';

export const COLOR_THEMES: Record<ColorTheme, { name: string; primary: string; accent: string; background: string }> = {
  amber: {
    name: 'Hổ phách',
    primary: '#f59e0b',
    accent: '#d97706',
    background: '#fffbeb',
  },
  blue: {
    name: 'Xanh dương',
    primary: '#3b82f6',
    accent: '#2563eb',
    background: '#eff6ff',
  },
  green: {
    name: 'Xanh lá',
    primary: '#22c55e',
    accent: '#16a34a',
    background: '#f0fdf4',
  },
  purple: {
    name: 'Tím',
    primary: '#a855f7',
    accent: '#9333ea',
    background: '#faf5ff',
  },
  pink: {
    name: 'Hồng',
    primary: '#ec4899',
    accent: '#db2777',
    background: '#fdf2f8',
  },
  rose: {
    name: 'Đỏ hồng',
    primary: '#f43f5e',
    accent: '#e11d48',
    background: '#fff1f2',
  },
};

export const LAYOUT_OPTIONS: { value: LayoutMode; label: string; icon: string }[] = [
  { value: 'grid', label: 'Lưới', icon: '⊞' },
  { value: 'list', label: 'Danh sách', icon: '☰' },
  { value: 'compact', label: 'Gọn', icon: '⊟' },
  { value: 'timeline', label: 'Dòng thời gian', icon: '⏳' },
  { value: 'masonry', label: 'Mosaics/Masonry', icon: '▦' },
];

export const DEFAULT_COLOR_THEME: ColorTheme = 'amber';
export const DEFAULT_LAYOUT: LayoutMode = 'grid';
