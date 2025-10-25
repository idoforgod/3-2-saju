'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * 메인 레이아웃 컴포넌트
 * Header와 Footer를 포함한 전체 페이지 레이아웃
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
