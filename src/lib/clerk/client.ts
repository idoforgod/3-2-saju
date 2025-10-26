'use client';

import { useAuth, useUser } from '@clerk/nextjs';

export { useAuth, useUser };

/**
 * Clerk 사용자 정보를 간편하게 사용하기 위한 훅
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
