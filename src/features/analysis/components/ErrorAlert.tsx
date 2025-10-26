'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalysisError } from '../types';

interface ErrorAlertProps {
  error: AnalysisError;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-700 font-medium">{error.message}</p>
      </div>

      <div className="flex gap-2">
        {error.recoverable && onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
            다시 시도
          </Button>
        )}

        {error.actionPath && error.actionLabel && (
          <Link href={error.actionPath}>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              {error.actionLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
