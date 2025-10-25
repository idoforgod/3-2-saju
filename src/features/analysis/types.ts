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
