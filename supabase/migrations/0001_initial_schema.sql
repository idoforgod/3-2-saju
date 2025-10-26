-- =====================================================
-- 구독제 사주분석 서비스 - 초기 스키마
-- 작성일: 2025-10-26
-- =====================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. users 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Clerk 사용자 정보 동기화 테이블';
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk User ID (외래키 역할)';

-- =====================================================
-- 2. subscriptions 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  billing_key VARCHAR(255),
  quota INT NOT NULL DEFAULT 3,
  next_payment_date DATE,
  last_payment_date DATE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  CHECK (plan_type IN ('free', 'pro')),
  CHECK (status IN ('active', 'cancelled', 'terminated')),
  CHECK (quota >= 0)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment_date ON subscriptions(next_payment_date);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE subscriptions IS '구독 정보 및 쿼터 관리 테이블';
COMMENT ON COLUMN subscriptions.plan_type IS 'free (무료 3회) | pro (월 10회)';
COMMENT ON COLUMN subscriptions.status IS 'active (활성) | cancelled (취소 예약) | terminated (해지)';
COMMENT ON COLUMN subscriptions.billing_key IS '토스페이먼츠 BillingKey (정기결제용)';
COMMENT ON COLUMN subscriptions.quota IS '남은 분석 횟수 (Free: 3, Pro: 10)';
COMMENT ON COLUMN subscriptions.next_payment_date IS '다음 결제일 (Pro 구독자만 해당)';
COMMENT ON COLUMN subscriptions.cancelled_at IS '구독 취소 요청 시간 (재활성화 가능 기간 판단용)';

-- =====================================================
-- 3. analyses 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time VARCHAR(10),
  gender VARCHAR(10) NOT NULL,
  result_markdown TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (gender IN ('male', 'female')),
  CHECK (birth_date BETWEEN '1900-01-01' AND CURRENT_DATE),
  CHECK (model_used IN ('gemini-2.5-flash', 'gemini-2.5-pro'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);

COMMENT ON TABLE analyses IS '사주 분석 결과 저장 테이블';
COMMENT ON COLUMN analyses.birth_time IS '출생시간 (HH:MM 형식, nullable - 시간 미상 가능)';
COMMENT ON COLUMN analyses.result_markdown IS 'Gemini AI가 생성한 분석 결과 (마크다운)';
COMMENT ON COLUMN analyses.model_used IS '사용된 Gemini 모델 (flash: 무료, pro: 유료)';

-- =====================================================
-- 4. RLS 비활성화 (요구사항)
-- =====================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ 초기 스키마 마이그레이션 완료';
  RAISE NOTICE '   - users 테이블 생성';
  RAISE NOTICE '   - subscriptions 테이블 생성';
  RAISE NOTICE '   - analyses 테이블 생성';
  RAISE NOTICE '   - 인덱스 및 트리거 설정 완료';
  RAISE NOTICE '   - RLS 비활성화 완료';
END $$;
