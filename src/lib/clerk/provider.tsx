'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import type { ReactNode } from 'react';

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider localization={koKR} afterSignOutUrl="/">
      {children}
    </BaseClerkProvider>
  );
}
