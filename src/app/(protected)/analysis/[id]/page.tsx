import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { AnalysisView } from './analysis-view';
import type { Analysis } from '@/features/analysis/types';
import type { Database } from '@/lib/supabase/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: PageProps) {
  // 1. 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Dynamic Route 파라미터 처리 (Next.js 15+ 대응)
  const { id } = await params;

  // 3. UUID 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound(); // 잘못된 ID 형식
  }

  // 4. Supabase에서 분석 데이터 조회
  const supabase = await createSupabaseServerClient();
  type AnalysisRow = Database['public']['Tables']['analyses']['Row'];
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single() as { data: AnalysisRow | null; error: unknown };

  // 5. 데이터 존재 확인
  if (error || !analysis) {
    notFound(); // 404: 존재하지 않는 분석
  }

  // 6. 권한 검증 (본인 소유 확인)
  if (analysis.clerk_user_id !== userId) {
    // 403 페이지로 리다이렉트
    redirect('/forbidden?reason=not_owner');
  }

  // 7. 타입 변환 및 클라이언트 컴포넌트로 데이터 전달
  const typedAnalysis: Analysis = {
    id: analysis.id,
    clerk_user_id: analysis.clerk_user_id,
    name: analysis.name,
    birth_date: analysis.birth_date,
    birth_time: analysis.birth_time,
    gender: analysis.gender as 'male' | 'female',
    result_markdown: analysis.result_markdown,
    model_used: analysis.model_used as 'gemini-2.5-flash' | 'gemini-2.5-pro',
    created_at: analysis.created_at,
  };

  return <AnalysisView analysis={typedAnalysis} />;
}
