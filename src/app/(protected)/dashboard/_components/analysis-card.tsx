'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Calendar, Clock, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Analysis {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  gender: 'male' | 'female';
  model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  created_at: string;
}

interface AnalysisCardProps {
  analysis: Analysis;
  onDelete: (id: string) => void;
}

export function AnalysisCard({ analysis, onDelete }: AnalysisCardProps) {
  const isPro = analysis.model_used === 'gemini-2.5-pro';

  return (
    <Card className="group relative overflow-hidden p-5 border border-border hover:border-primary/50 shadow-purple-md hover:shadow-purple-lg hover:-translate-y-1 transition-all duration-300">
      {/* 배경 장식 */}
      {isPro && (
        <div className="absolute top-0 right-0 w-32 h-32 gradient-purple opacity-5 blur-2xl pointer-events-none" />
      )}

      {/* 헤더 */}
      <div className="relative flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
            {analysis.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {analysis.gender === 'male' ? '남성' : '여성'}
          </p>
        </div>
        <button
          onClick={() => onDelete(analysis.id)}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          aria-label="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 정보 */}
      <div className="relative space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{analysis.birth_date}</span>
        </div>
        {analysis.birth_time && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-accent" />
            <span>{analysis.birth_time}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>📅</span>
          <span>분석일: {new Date(analysis.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* 하단 */}
      <div className="relative flex items-center justify-between pt-4 border-t border-border">
        {/* 모델 뱃지 */}
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
          isPro
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {isPro ? (
            <Zap className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isPro ? 'Pro' : 'Flash'}</span>
        </div>

        {/* 상세보기 버튼 */}
        <Link href={'/analysis/' + analysis.id}>
          <Button
            variant="ghost"
            size="sm"
            className="group/btn hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            <span>상세보기</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}
