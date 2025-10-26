import { z } from 'zod';

/**
 * 사주 입력 스키마
 */
export const sajuInputSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 최대 50자까지 입력 가능합니다.'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일은 YYYY-MM-DD 형식이어야 합니다.'),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, '출생시간은 HH:MM 형식이어야 합니다.')
    .optional(),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: '성별을 선택해주세요.' }),
  }),
});

/**
 * 분석 생성 응답 스키마
 */
export const createAnalysisResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    analysisId: z.string().uuid(),
    createdAt: z.string(),
  }),
});

/**
 * API 에러 응답 스키마
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

/**
 * TypeScript 타입 추론
 */
export type SajuInputDto = z.infer<typeof sajuInputSchema>;
export type CreateAnalysisResponse = z.infer<typeof createAnalysisResponseSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
