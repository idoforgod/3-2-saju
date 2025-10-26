'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SajuFormData, CreateAnalysisResponse } from '../types';

/**
 * 분석 생성 Mutation 훅
 */
export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SajuFormData) => {
      const response = await apiClient.post<CreateAnalysisResponse>(
        '/api/analysis/create',
        data,
        {
          timeout: 60000, // 60초 타임아웃
        }
      );
      return response.data;
    },

    onSuccess: () => {
      // 쿼터 캐시 무효화 (재조회 트리거)
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['quota'] });

      // 최근 분석 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },

    retry: false, // 재시도 비활성화 (쿼터 중복 차감 방지)
  });
}
