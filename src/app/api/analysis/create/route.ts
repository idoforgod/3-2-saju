import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { sajuInputSchema } from '@/lib/validation/schemas';
import { geminiClient } from '@/lib/gemini/client';
import { generateSajuPrompt } from '@/lib/gemini/prompts';

export async function POST(req: NextRequest) {
  try {
    // 1. 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 2. 요청 데이터 파싱 및 검증
    const body = await req.json();
    const validationResult = sajuInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '입력값이 올바르지 않습니다',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // 3. 쿼터 확인 및 플랜 타입 조회
    const supabase = await createSupabaseServerClient();

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select<'quota, plan_type, status', { quota: number; plan_type: 'free' | 'pro'; status: 'active' | 'cancelled' | 'terminated' }>('quota, plan_type, status')
      .eq('clerk_user_id', userId)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: '구독 정보를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (subscription.quota <= 0) {
      return NextResponse.json(
        { error: '사용 가능한 횟수가 없습니다. Pro 구독이 필요합니다.' },
        { status: 403 }
      );
    }

    if (subscription.status === 'terminated') {
      return NextResponse.json(
        { error: '해지된 구독입니다. 재구독이 필요합니다.' },
        { status: 403 }
      );
    }

    // 4. Gemini API 호출
    const prompt = generateSajuPrompt(input);
    const isPro = subscription.plan_type === 'pro';

    const analysisResult = await geminiClient.analyze(prompt, isPro);

    // 5. Supabase RPC: 쿼터 차감 + 분석 저장 (트랜잭션)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: analysisId, error: rpcError } = await (supabase.rpc as any)(
      'decrement_quota_and_insert_analysis',
      {
        p_clerk_user_id: userId,
        p_name: input.name,
        p_birth_date: input.birthDate,
        p_birth_time: input.birthTime ?? null,
        p_gender: input.gender,
        p_result_markdown: analysisResult,
        p_model_used: isPro ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
      }
    );

    if (rpcError) {
      console.error('RPC Error:', rpcError);

      if (rpcError.message?.includes('Insufficient quota')) {
        return NextResponse.json(
          { error: '사용 가능한 횟수가 없습니다' },
          { status: 403 }
        );
      }

      throw rpcError;
    }

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      analysisId: analysisId,
    });

  } catch (error) {
    console.error('Analysis creation error:', error);

    // Gemini API 오류
    if (error instanceof Error && error.message?.includes('사주 분석 중 오류')) {
      return NextResponse.json(
        { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 기타 서버 오류
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
