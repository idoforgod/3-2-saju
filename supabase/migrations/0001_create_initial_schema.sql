-- =====================================================
-- Migration: Create Initial Schema for Saju Service
-- Version: 2.0
-- Description: 구독제 사주분석 서비스 초기 스키마
-- Date: 2025-10-25
-- =====================================================

BEGIN;

-- ==============================
-- 1. Extensions
-- ==============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================
-- 2. subscriptions 테이블
-- ==============================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  billing_key VARCHAR(255),
  quota INTEGER NOT NULL DEFAULT 3,
  next_payment_date DATE,
  last_payment_date DATE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- CHECK 제약조건
  CONSTRAINT check_plan_type CHECK (plan_type IN ('free', 'pro')),
  CONSTRAINT check_status CHECK (status IN ('active', 'cancelled', 'terminated')),
  CONSTRAINT check_quota CHECK (quota >= 0),
  CONSTRAINT check_cancelled_at CHECK (status != 'cancelled' OR cancelled_at IS NOT NULL),
  CONSTRAINT check_next_payment_date CHECK (plan_type = 'pro' OR next_payment_date IS NULL),
  CONSTRAINT check_billing_key CHECK (plan_type != 'pro' OR billing_key IS NOT NULL OR status = 'terminated')
);

-- subscriptions 인덱스
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user ON public.subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_payment ON public.subscriptions(status, next_payment_date)
  WHERE status = 'active' AND next_payment_date IS NOT NULL;

COMMENT ON TABLE public.subscriptions IS '사용자 구독 상태 및 쿼터 관리 (Clerk User ID 기준)';
COMMENT ON COLUMN public.subscriptions.clerk_user_id IS 'Clerk User ID (외래키 역할, CASCADE 삭제는 Webhook에서 처리)';
COMMENT ON COLUMN public.subscriptions.plan_type IS 'free (무료 3회) | pro (월 10회)';
COMMENT ON COLUMN public.subscriptions.status IS 'active (정상) | cancelled (취소 예약) | terminated (완전 해지)';
COMMENT ON COLUMN public.subscriptions.billing_key IS '토스페이먼츠 BillingKey (Pro만 필수)';
COMMENT ON COLUMN public.subscriptions.quota IS '남은 분석 횟수 (동시성 제어: SELECT FOR UPDATE 사용)';
COMMENT ON COLUMN public.subscriptions.next_payment_date IS '다음 결제일 (Pro만, Cron 조회용)';
COMMENT ON COLUMN public.subscriptions.cancelled_at IS '구독 취소 요청 시간 (재활성화 가능 여부 판단)';

-- ==============================
-- 3. analyses 테이블
-- ==============================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  gender VARCHAR(10) NOT NULL,
  result_markdown TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- CHECK 제약조건
  CONSTRAINT check_birth_date CHECK (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE),
  CONSTRAINT check_gender CHECK (gender IN ('male', 'female')),
  CONSTRAINT check_model_used CHECK (model_used IN ('gemini-2.5-flash', 'gemini-2.5-pro'))
);

-- analyses 인덱스
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON public.analyses(clerk_user_id, created_at DESC);

COMMENT ON TABLE public.analyses IS '사주 분석 이력 저장 (Clerk User ID 연동, CASCADE 삭제는 Webhook에서 처리)';
COMMENT ON COLUMN public.analyses.clerk_user_id IS 'Clerk User ID (subscriptions와 동일한 외래키 역할)';
COMMENT ON COLUMN public.analyses.birth_time IS '출생 시간 (선택 입력, 미상 가능)';
COMMENT ON COLUMN public.analyses.result_markdown IS 'Gemini API 응답 (마크다운 형식, 최대 100KB)';
COMMENT ON COLUMN public.analyses.model_used IS 'Free: gemini-2.5-flash | Pro: gemini-2.5-pro';

-- ==============================
-- 4. updated_at 자동 업데이트 트리거
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'updated_at 컬럼 자동 갱신';

-- ==============================
-- 5. 쿼터 차감 RPC (원자성 보장)
-- ==============================
CREATE OR REPLACE FUNCTION public.decrement_quota_and_insert_analysis(
  p_clerk_user_id VARCHAR(255),
  p_name VARCHAR(100),
  p_birth_date DATE,
  p_birth_time TIME,
  p_gender VARCHAR(10),
  p_result_markdown TEXT,
  p_model_used VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
  v_analysis_id UUID;
  v_current_quota INTEGER;
BEGIN
  -- 1. 쿼터 확인 및 차감 (FOR UPDATE로 행 레벨 락)
  SELECT quota INTO v_current_quota
  FROM public.subscriptions
  WHERE clerk_user_id = p_clerk_user_id
  FOR UPDATE;

  -- 쿼터 부족 예외 처리
  IF v_current_quota IS NULL THEN
    RAISE EXCEPTION 'User subscription not found: %', p_clerk_user_id
      USING HINT = 'Check if user has valid subscription';
  END IF;

  IF v_current_quota <= 0 THEN
    RAISE EXCEPTION 'Insufficient quota for user: %', p_clerk_user_id
      USING HINT = 'Upgrade to Pro plan or wait for quota reset';
  END IF;

  -- 쿼터 차감
  UPDATE public.subscriptions
  SET quota = quota - 1,
      updated_at = NOW()
  WHERE clerk_user_id = p_clerk_user_id;

  -- 2. 분석 결과 저장
  INSERT INTO public.analyses (clerk_user_id, name, birth_date, birth_time, gender, result_markdown, model_used)
  VALUES (p_clerk_user_id, p_name, p_birth_date, p_birth_time, p_gender, p_result_markdown, p_model_used)
  RETURNING id INTO v_analysis_id;

  -- 3. 분석 ID 반환
  RETURN v_analysis_id;

EXCEPTION
  WHEN OTHERS THEN
    -- 예외 발생 시 자동 롤백 (PostgreSQL 기본 동작)
    RAISE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.decrement_quota_and_insert_analysis IS '쿼터 차감과 분석 저장을 원자적으로 처리 (트랜잭션 보장)';

-- ==============================
-- 6. RLS 비활성화 (Supabase 가이드라인)
-- ==============================
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses DISABLE ROW LEVEL SECURITY;

-- ==============================
-- 7. 초기 데이터 검증 (개발용)
-- ==============================
-- Note: 프로덕션 배포 시 삭제 가능
INSERT INTO public.subscriptions (clerk_user_id, plan_type, quota, status)
VALUES ('clerk_dev_test_user_001', 'free', 3, 'active')
ON CONFLICT (clerk_user_id) DO NOTHING;

COMMIT;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next Steps:
-- 1. Clerk Webhook 설정: /api/webhooks/clerk
-- 2. Cron Job 설정: Supabase Dashboard에서 process-billing 등록
-- 3. 환경 변수 확인: SUPABASE_SERVICE_ROLE_KEY, CLERK_WEBHOOK_SECRET
-- =====================================================
