import { z } from 'zod';
import { sajuInputSchema } from './schemas';

/**
 * 사주 분석 입력 타입 (Zod 스키마에서 추론)
 */
export type SajuInputType = z.infer<typeof sajuInputSchema>;
