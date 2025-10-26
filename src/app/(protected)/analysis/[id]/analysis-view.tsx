'use client';

import { MarkdownRenderer } from '@/lib/markdown/parser';
import { formatDate, formatTime } from '@/lib/utils/date';
import type { Analysis } from '@/features/analysis/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, User, CalendarDays, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisViewProps {
  analysis: Analysis;
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  const [parseError, setParseError] = useState(false);
  const isPro = analysis.model_used === 'gemini-2.5-pro';

  useEffect(() => {
    // 마크다운 파싱 오류 감지
    if (!analysis.result_markdown || analysis.result_markdown.trim() === '') {
      setParseError(true);
      toast.error('분석 결과를 표시할 수 없습니다.');
    }
  }, [analysis]);

  return (
    <div className="min-h-screen gradient-purple-subtle py-8 sm:py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* 헤더: 분석 대상 정보 */}
        <Card className="relative overflow-hidden border-2 border-border shadow-purple-xl p-6 sm:p-8 mb-6 animate-fade-in-up">
          {/* 배경 장식 */}
          {isPro && (
            <div className="absolute top-0 right-0 w-64 h-64 gradient-purple opacity-5 blur-3xl pointer-events-none" />
          )}

          <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                <span className="text-gradient-purple">{analysis.name}님</span>의 사주 분석
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
                  isPro ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {isPro ? (
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isPro ? 'Pro 모델' : 'Flash 모델'}</span>
                </div>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-2 hover:bg-muted transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
          </div>

          {/* 분석 대상 상세 정보 */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">생년월일</p>
              </div>
              <p className="text-base font-semibold text-foreground">
                {formatDate(analysis.birth_date)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">출생 시간</p>
              </div>
              <p className="text-base font-semibold text-foreground">
                {analysis.birth_time ? formatTime(analysis.birth_time) : '미상'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-secondary" />
                <p className="text-xs font-medium text-muted-foreground">성별</p>
              </div>
              <p className="text-base font-semibold text-foreground">
                {analysis.gender === 'male' ? '남성' : '여성'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-success" />
                <p className="text-xs font-medium text-muted-foreground">분석 일시</p>
              </div>
              <p className="text-base font-semibold text-foreground">
                {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </Card>

        {/* 분석 결과 본문 */}
        <Card className="border-2 border-border shadow-purple-xl p-6 sm:p-8 animate-fade-in-up animation-delay-100">
          {parseError ? (
            <div className="text-center py-12">
              {/* 에러 아이콘 */}
              <div className="flex justify-center mb-6">
                <div className="relative inline-flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 bg-destructive/10 rounded-full blur-xl animate-pulse-slow" />
                  <div className="relative p-3 rounded-full bg-destructive/10">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                </div>
              </div>

              <p className="text-lg font-semibold text-destructive mb-4">
                분석 결과를 불러올 수 없습니다
              </p>
              <pre className="bg-muted p-4 rounded-lg text-left overflow-x-auto text-sm text-muted-foreground max-w-2xl mx-auto">
                {analysis.result_markdown}
              </pre>
            </div>
          ) : (
            <MarkdownRenderer content={analysis.result_markdown} />
          )}
        </Card>
      </div>
    </div>
  );
}
