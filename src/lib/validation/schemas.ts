import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(2, '이름은 2자 이상이어야 합니다')
  .max(50, '이름은 50자 이내여야 합니다');

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

export const birthTimeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, '올바른 시간 형식(HH:MM)을 입력해주세요')
  .optional();

export const genderSchema = z.enum(['male', 'female'], {
  errorMap: () => ({ message: '성별을 선택해주세요' }),
});

export const sajuInputSchema = z.object({
  name: nameSchema,
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  gender: genderSchema,
});
