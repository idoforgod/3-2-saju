import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { SubscriptionCard } from './_components/subscription-card';
import { AnalysisHistory } from './_components/analysis-history';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createSupabaseServerClient();

  try {
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('id, name, birth_date, birth_time, gender, model_used, created_at')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">대시보드</h1>

        <SubscriptionCard />
        <AnalysisHistory initialAnalyses={analyses ?? []} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">대시보드</h1>
        <p className="text-red-600">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }
}
