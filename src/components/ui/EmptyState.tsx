// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16 px-4 bg-white dark:bg-gray-900 border border-amber-100 rounded-2xl max-w-lg mx-auto shadow-xs', className)}>
      <div className="text-5xl mb-4 animate-pulse select-none">📭</div>
      <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-6 px-6 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-100 font-medium rounded-xl transition-all shadow-sm text-xs tracking-wider uppercase font-mono border border-amber-800"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
