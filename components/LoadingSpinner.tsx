/**
 * Loading Spinner Component
 * Hiển thị loading state đẹp hơn
 */

'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <Loader2
        className={`${sizeClasses[size]} text-military-green animate-spin`}
      />
      {text && <p className="text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}
