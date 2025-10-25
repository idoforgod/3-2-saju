'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

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
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{analysis.name}</h3>
        <button
          onClick={() => onDelete(analysis.id)}
          className="text-gray-400 hover:text-red-600 transition-colors"
          aria-label="삭제"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>생년월일: {analysis.birth_date}</p>
        {analysis.birth_time && (
          <p>출생시간: {analysis.birth_time}</p>
        )}
        <p>분석일: {new Date(analysis.created_at).toLocaleDateString('ko-KR')}</p>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className={'text-xs px-2 py-1 rounded ' + (isPro ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700')}>
          {isPro ? 'Pro 모델' : 'Flash 모델'}
        </span>

        <Link href={'/analysis/' + analysis.id}>
          <Button variant="ghost" size="sm">
            상세보기
          </Button>
        </Link>
      </div>
    </Card>
  );
}
