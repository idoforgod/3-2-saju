'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-all duration-200"
        >
          <div className="relative">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:text-secondary transition-colors duration-200" />
            <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gradient-purple">
            사주풀이
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  내 분석
                </Button>
              </Link>
              <Link href="/analysis/new">
                <Button
                  className="bg-primary text-primary-foreground shadow-purple-md hover:shadow-purple-lg hover:scale-105 transition-all duration-200"
                >
                  <span className="hidden sm:inline">새 분석</span>
                  <span className="sm:hidden">분석</span>
                </Button>
              </Link>
              <Link href="/subscription" className="hidden md:block">
                <Button
                  variant="ghost"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  구독 관리
                </Button>
              </Link>
              <div className="ml-2">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 sm:w-10 sm:h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  로그인
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  className="bg-primary text-primary-foreground shadow-purple-md hover:shadow-purple-lg hover:scale-105 transition-all duration-200"
                >
                  시작하기
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
