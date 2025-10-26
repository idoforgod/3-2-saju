-- =====================================================
-- 구독제 사주분석 서비스 - 최소 스키마 v2.0
-- 작성일: 2025-10-26
-- 설계: YC 스타트업 CTO - 최소주의 원칙
-- =====================================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  clerk_user_id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Clerk 사용자 동기화';
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk User ID (PK)';

-- =====================================================
-- 2. subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  clerk_user_id VARCHAR(255) PRIMARY KEY REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  billing_key VARCHAR(255),
  quota INT NOT NULL DEFAULT 3,
  next_payment_date DATE,
  last_payment_date DATE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 비즈니스 규칙 강제
  CHECK (plan_type IN ('free', 'pro')),
  CHECK (status IN ('active', 'cancelled', 'terminated')),
  CHECK (
    (plan_type = 'free' AND quota BETWEEN 0 AND 3) OR
    (plan_type = 'pro' AND quota BETWEEN 0 AND 10)
  ),
  CHECK (
    (plan_type = 'free') OR
    (plan_type = 'pro' AND billing_key IS NOT NULL)
  ),
  CHECK (
    (plan_type = 'free') OR
    (status != 'active') OR
    (status = 'active' AND next_payment_date IS NOT NULL)
  )
);

-- Cron 쿼리 최적화 (파셜 인덱스)
CREATE INDEX IF NOT EXISTS idx_next_payment_date ON subscriptions(next_payment_date)
WHERE status = 'active' AND next_payment_date IS NOT NULL;

COMMENT ON TABLE subscriptions IS '구독 및 쿼터 관리';
COMMENT ON COLUMN subscriptions.quota IS 'Free: 0-3, Pro: 0-10';
COMMENT ON COLUMN subscriptions.next_payment_date IS 'Pro 활성 구독 필수';

-- =====================================================
-- 3. analyses
-- =====================================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time VARCHAR(10),
  gender VARCHAR(10) NOT NULL,
  result_markdown TEXT NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 데이터 검증
  CHECK (gender IN ('male', 'female')),
  CHECK (birth_date BETWEEN '1900-01-01' AND CURRENT_DATE),
  CHECK (model_used IN ('gemini-2.5-flash', 'gemini-2.5-pro')),
  CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 50)
);

-- 사용자별 최신 분석 조회 최적화 (커버링 인덱스)
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(clerk_user_id, created_at DESC);

COMMENT ON TABLE analyses IS '사주 분석 결과';
COMMENT ON COLUMN analyses.birth_time IS 'HH:MM 또는 NULL (시간 미상)';

-- =====================================================
-- 4. RLS 비활성화
-- =====================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 완료
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ v2.0 스키마 마이그레이션 완료';
  RAISE NOTICE '   - 테이블: 3개 (users, subscriptions, analyses)';
  RAISE NOTICE '   - 인덱스: 2개 (효율적 최소화)';
  RAISE NOTICE '   - CHECK 제약: 10개 (비즈니스 규칙 강제)';
  RAISE NOTICE '   - 트리거: 0개 (불필요 제거)';
END $$;
