'use client';

import { useState } from 'react';
import { AnalysisCard } from './analysis-card';
import { EmptyState } from './empty-state';
import { DeleteModal } from './delete-modal';
import { toast } from 'sonner';

interface Analysis {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  gender: 'male' | 'female';
  model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  created_at: string;
}

interface AnalysisHistoryProps {
  initialAnalyses: Analysis[];
}

export function AnalysisHistory({ initialAnalyses }: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>(initialAnalyses);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    // 낙관적 업데이트
    const previousAnalyses = analyses;
    setAnalyses(prev => prev.filter(a => a.id !== deleteTarget));

    try {
      const res = await fetch('/api/analysis/' + deleteTarget, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      toast.success('분석이 삭제되었습니다');
      setDeleteTarget(null);
    } catch (error) {
      // 롤백
      setAnalyses(previousAnalyses);
      toast.error('삭제 중 오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  if (analyses.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">분석 이력</h2>
        <p className="text-sm text-gray-600">
          총 {analyses.length}건
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.map(analysis => (
          <AnalysisCard
            key={analysis.id}
            analysis={analysis}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
