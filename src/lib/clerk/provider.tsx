'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

/**
 * Clerk Provider 래퍼 컴포넌트
 * Next.js App Router에서 사용하기 위한 설정을 포함
 */
export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <BaseClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      {children}
    </BaseClerkProvider>
  );
}
