import { z } from 'zod';

/**
 * 이름 검증 스키마
 */
export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요')
  .max(20, '이름은 20자 이내여야 합니다');

/**
 * 생년월일 검증 스키마 (YYYY-MM-DD)
 */
export const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요')
  .refine(
    (date) => {
      const d = new Date(date);
      const now = new Date();
      return d.getFullYear() >= 1900 && d <= now;
    },
    '1900년 이후부터 오늘까지의 날짜를 입력해주세요'
  );

/**
 * 출생시간 검증 스키마 (HH:MM, 선택)
 */
export const birthTimeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, '올바른 시간 형식(HH:MM)을 입력해주세요')
  .optional();

/**
 * 성별 검증 스키마
 */
export const genderSchema = z.enum(['male', 'female'], {
  errorMap: () => ({ message: '성별을 선택해주세요' }),
});

/**
 * 사주 분석 입력 스키마
 */
export const sajuInputSchema = z.object({
  name: nameSchema,
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  gender: genderSchema,
});

/**
 * 이메일 검증 스키마
 */
export const emailSchema = z
  .string()
  .email('올바른 이메일 주소를 입력해주세요');

/**
 * 전화번호 검증 스키마 (한국 형식)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^01[0-9]-\d{3,4}-\d{4}$/,
    '올바른 전화번호 형식(010-1234-5678)을 입력해주세요'
  );
