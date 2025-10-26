import type { AnalysisError } from '../types';

/**
 * API 에러를 파싱하여 사용자 친화적 에러 정보로 변환
 */
export function parseApiError(error: unknown): AnalysisError {
  // Axios 에러 타입 체크
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          error?: {
            code?: string;
            message?: string;
          };
        };
      };
      code?: string;
    };

    const status = axiosError.response?.status;
    const code = axiosError.response?.data?.error?.code;
    const message = axiosError.response?.data?.error?.message;

    // 쿼터 부족
    if (status === 400 && code === 'QUOTA_EXCEEDED') {
      return {
        type: 'quota',
        message: message || '남은 분석 횟수가 없습니다. Pro 구독을 이용해주세요.',
        recoverable: false,
        actionLabel: 'Pro 구독하기',
        actionPath: '/subscription',
      };
    }

    // 검증 에러
    if (status === 400 && code === 'VALIDATION_ERROR') {
      return {
        type: 'validation',
        message: message || '입력 정보를 확인해주세요.',
        recoverable: true,
      };
    }

    // 타임아웃
    if (axiosError.code === 'ECONNABORTED') {
      return {
        type: 'timeout',
        message: '분석 시간이 초과되었습니다. 다시 시도해주세요.',
        recoverable: true,
      };
    }

    // 네트워크 에러
    if (!axiosError.response) {
      return {
        type: 'network',
        message: '인터넷 연결을 확인해주세요.',
        recoverable: true,
      };
    }

    // 서버 에러 (500번대)
    if (status && status >= 500) {
      return {
        type: 'api',
        message: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        recoverable: true,
      };
    }
  }

  // 알 수 없는 에러
  return {
    type: 'unknown',
    message: '알 수 없는 오류가 발생했습니다.',
    recoverable: true,
  };
}
