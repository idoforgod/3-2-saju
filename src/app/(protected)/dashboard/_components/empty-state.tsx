'use client';

import { Button } from '@/components/ui/button';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-16 sm:py-20 animate-fade-in-up">
      {/* 아이콘 */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse-slow" />
        <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        </div>
      </div>

      {/* 텍스트 */}
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
        아직 분석 이력이 없습니다
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
        첫 분석을 시작하고 AI가 제공하는 깊이 있는 사주 해석을 경험해보세요
      </p>

      {/* CTA 버튼 */}
      <Link href="/analysis/new">
        <Button
          size="lg"
          className="group gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          <span>새 분석 시작하기</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </Link>

      {/* 추가 정보 */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>30초 즉시 분석</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse animation-delay-100" />
          <span>무료 3회 제공</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse animation-delay-200" />
          <span>무제한 조회</span>
        </div>
      </div>
    </div>
  );
}
