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

interface AnalysisViewProps {
  analysis: Analysis;
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    // 마크다운 파싱 오류 감지
    if (!analysis.result_markdown || analysis.result_markdown.trim() === '') {
      setParseError(true);
      toast.error('분석 결과를 표시할 수 없습니다.');
    }
  }, [analysis]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 헤더: 분석 대상 정보 */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {analysis.name}님의 사주 분석
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={analysis.model_used === 'gemini-2.5-pro' ? 'default' : 'secondary'}>
                {analysis.model_used === 'gemini-2.5-pro' ? 'Pro 모델' : 'Flash 모델'}
              </Badge>
              <span className="text-sm text-gray-500">
                {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <Link href="/dashboard">
            <Button variant="outline">목록으로</Button>
          </Link>
        </div>

        {/* 분석 대상 상세 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">생년월일</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(analysis.birth_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">출생 시간</p>
            <p className="text-base font-semibold text-gray-900">
              {analysis.birth_time ? formatTime(analysis.birth_time) : '미상'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">성별</p>
            <p className="text-base font-semibold text-gray-900">
              {analysis.gender === 'male' ? '남성' : '여성'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">분석 일시</p>
            <p className="text-base font-semibold text-gray-900">
              {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </Card>

      {/* 분석 결과 본문 */}
      <Card className="p-8">
        {parseError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">분석 결과를 불러올 수 없습니다.</p>
            <pre className="bg-gray-100 p-4 rounded text-left overflow-x-auto text-sm">
              {analysis.result_markdown}
            </pre>
          </div>
        ) : (
          <MarkdownRenderer content={analysis.result_markdown} />
        )}
      </Card>
    </div>
  );
}
