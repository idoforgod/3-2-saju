import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '@/backend/config';

const genAI = new GoogleGenerativeAI(getEnv().GEMINI_API_KEY);

/**
 * Gemini API를 사용한 사주 분석
 */
export async function analyzeWithGemini(
  prompt: string,
  isPro: boolean
): Promise<string> {
  const model = isPro ? 'gemini-2.0-flash-exp' : 'gemini-2.0-flash-exp';
  const geminiModel = genAI.getGenerativeModel({ model });

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}

/**
 * 사용된 모델명 반환
 */
export function getModelName(isPro: boolean): string {
  return isPro ? 'gemini-2.0-flash-exp' : 'gemini-2.0-flash-exp';
}
