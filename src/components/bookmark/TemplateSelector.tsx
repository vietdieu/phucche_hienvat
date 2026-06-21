'use client';

import React from 'react';
import { templates, PDFTemplate } from './PDFTemplates';
import { cn } from '@/utils';

interface TemplateSelectorProps {
  selected: PDFTemplate;
  onSelect: (template: PDFTemplate) => void;
  className?: string;
}

export function TemplateSelector({ selected, onSelect, className }: TemplateSelectorProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3', className)}>
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
          className={cn(
            'p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer flex flex-col justify-between h-full bg-[#FAF7F2] dark:bg-gray-800',
            selected === template.id
              ? 'border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
              : 'border-amber-100/30 dark:border-gray-700 hover:border-amber-400 dark:hover:border-gray-600'
          )}
        >
          <div>
            <div className="text-2xl mb-2">{template.icon}</div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">{template.label}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{template.description}</div>
          </div>
          {selected === template.id && (
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-850 dark:text-amber-300 mt-2 self-end bg-amber-200/40 px-1.5 py-0.5 rounded">
              Đang chọn
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
