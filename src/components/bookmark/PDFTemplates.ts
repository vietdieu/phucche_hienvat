export type PDFTemplate = 'modern' | 'classic' | 'minimal';

export interface TemplateConfig {
  id: PDFTemplate;
  label: string;
  icon: string;
  description: string;
}

export const templates: TemplateConfig[] = [
  {
    id: 'modern',
    label: 'Hiện đại',
    icon: '✨',
    description: 'Bố cục sáng tạo, tông màu hổ phách sang trọng'
  },
  {
    id: 'classic',
    label: 'Cổ điển',
    icon: '📜',
    description: 'Phong cách hoài cổ, trang nhã tinh tế'
  },
  {
    id: 'minimal',
    label: 'Tối giản',
    icon: '⬜',
    description: 'Bố cục tinh gọn, trực quan, đơn sắc'
  }
];
