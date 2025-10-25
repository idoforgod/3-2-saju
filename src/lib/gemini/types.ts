/**
 * 사주 분석 입력 데이터 타입
 */
export interface SajuInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  gender: 'male' | 'female';
}

/**
 * Gemini 모델 타입
 */
export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';
