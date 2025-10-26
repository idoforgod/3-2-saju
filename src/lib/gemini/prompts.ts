import type { SajuInput } from '@/lib/validation/schemas';

/**
 * 사주 분석 프롬프트 생성
 */
export function generateSajuPrompt(input: SajuInput): string {
  const birthTimeText = input.birthTime || '시간 미상';
  const genderText = input.gender === 'male' ? '남성' : '여성';

  return `당신은 20년 경력의 전문 사주팔자 상담사입니다.

**입력 정보**:
- 성함: ${input.name}
- 생년월일: ${input.birthDate}
- 출생시간: ${birthTimeText}
- 성별: ${genderText}

**분석 요구사항**:
1️⃣ 천간(天干)과 지지(地支) 계산
2️⃣ 오행(五行) 분석 (목, 화, 토, 금, 수)
3️⃣ 대운(大運)과 세운(歲運) 해석
4️⃣ 전반적인 성격, 재운, 건강운, 연애운 분석

**출력 형식**: 마크다운 (제목, 소제목, 리스트 활용)

**금지 사항**:
- 의료·법률 조언 금지
- 확정적 미래 예측 금지 (가능성으로 표현)
- 부정적·공격적 표현 금지

이제 분석을 시작해주세요.`;
}
