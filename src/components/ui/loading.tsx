'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트
 * @param size - 스피너 크기 (sm: 16px, md: 24px, lg: 32px)
 * @param className - 추가 CSS 클래스
 */
export function Loading({ size = 'md', className }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-purple-600 border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

/**
 * 전체 화면 로딩 컴포넌트
 */
export function FullPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loading size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

/**
 * 인라인 로딩 컴포넌트 (버튼 내부 등에 사용)
 */
export function InlineLoading({ text = '처리 중...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loading size="sm" />
      <span>{text}</span>
    </div>
  );
}
