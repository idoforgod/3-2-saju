'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { LogOut } from 'lucide-react';

/**
 * 전역 헤더 컴포넌트
 * Supabase 인증 상태에 따라 로그인/로그아웃 UI 표시
 */
export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, refresh } = useCurrentUser();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          사주풀이
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">내 분석</Button>
              </Link>
              <Link href="/analysis/new">
                <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                  새 분석
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="ghost">구독 관리</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700">시작하기</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
