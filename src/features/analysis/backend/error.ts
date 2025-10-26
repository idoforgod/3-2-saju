/**
 * 분석 에러 코드 정의
 */
export enum AnalysisErrorCode {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * 에러 메시지 매핑
 */
export const AnalysisErrorMessages = {
  QUOTA_EXCEEDED: '남은 분석 횟수가 없습니다. Pro 구독을 이용해주세요.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
  API_ERROR: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  NOT_FOUND: '분석 결과를 찾을 수 없습니다.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
} as const;
