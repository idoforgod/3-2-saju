/**
 * 사주 분석 관련 타입 정의
 */

export interface Analysis {
  id: string;
  clerk_user_id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string | null; // HH:MM or null
  gender: 'male' | 'female';
  result_markdown: string;
  model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  created_at: string; // ISO 8601 timestamp
}

/**
 * 사주 폼 입력 데이터
 */
export interface SajuFormData {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  gender: 'male' | 'female';
}

/**
 * 분석 진행 상태
 */
export type AnalysisState = 'idle' | 'validating' | 'analyzing' | 'success' | 'error';

/**
 * 쿼터 정보
 */
export interface QuotaInfo {
  quota: number;
  planType: 'free' | 'pro';
  maxQuota: number;
}

/**
 * 구독 상태 정보
 */
export interface SubscriptionStatus {
  planType: 'free' | 'pro';
  quota: number;
  status: 'active' | 'cancelled' | 'terminated';
  nextPaymentDate?: string;
}

/**
 * 분석 에러 정보
 */
export interface AnalysisError {
  type: 'quota' | 'validation' | 'api' | 'network' | 'timeout' | 'unknown';
  message: string;
  recoverable: boolean;
  actionLabel?: string;
  actionPath?: string;
}

/**
 * 분석 생성 API 응답
 */
export interface CreateAnalysisResponse {
  success: true;
  data: {
    analysisId: string;
    createdAt: string;
  };
}

/**
 * API 에러 응답
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * 폼 기본값
 */
export const defaultFormValues: SajuFormData = {
  name: '',
  birthDate: '',
  birthTime: undefined,
  gender: 'male',
};
