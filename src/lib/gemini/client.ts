import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiModel } from './types';

/**
 * Gemini API 클라이언트
 * Free 플랜: gemini-2.5-flash
 * Pro 플랜: gemini-2.5-pro
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (!key) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(key);
  }

  /**
   * 사주 분석 요청
   * @param prompt - 사주 분석 프롬프트
   * @param isPro - Pro 플랜 여부 (true: gemini-2.5-pro, false: gemini-2.5-flash)
   * @returns 마크다운 형식의 분석 결과
   */
  async analyze(prompt: string, isPro: boolean): Promise<string> {
    const modelName: GeminiModel = isPro
      ? 'gemini-2.5-pro'
      : 'gemini-2.5-flash';

    const model = this.genAI.getGenerativeModel({ model: modelName });

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('사주 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
}

/**
 * 싱글톤 Gemini 클라이언트 인스턴스
 */
export const geminiClient = new GeminiClient();
