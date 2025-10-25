'use client';

import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs';

export { ClerkProvider, useAuth, useUser };

/**
 * Clerk 사용자 정보를 간편하게 사용하기 위한 커스텀 훅
 */
export const useClerkUser = () => {
  const { user, isLoaded } = useUser();
  return {
    user,
    isLoaded,
    userId: user?.id || null,
    email: user?.emailAddresses?.[0]?.emailAddress || null,
    name: user?.fullName || null,
  };
};
