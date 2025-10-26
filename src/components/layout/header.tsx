'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          사주풀이
        </Link>

        <nav className="flex items-center gap-6">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">내 분석</Button>
              </Link>
              <Link href="/analysis/new">
                <Button variant="default">새 분석</Button>
              </Link>
              <Link href="/subscription">
                <Button variant="ghost">구독 관리</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="default">시작하기</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
