# 구독 관리 페이지 (`/subscription`) 구현 계획

**페이지 경로**: `/subscription`
**페이지 ID**: Page-05
**작성일**: 2025-10-26
**버전**: 1.0
**우선순위**: P0 (MVP 필수)

---

## 목차

1. [페이지 개요](#1-페이지-개요)
2. [기능 요구사항](#2-기능-요구사항)
3. [UI/UX 설계](#3-uiux-설계)
4. [상태 관리](#4-상태-관리)
5. [API 연동](#5-api-연동)
6. [컴포넌트 구조](#6-컴포넌트-구조)
7. [구현 상세](#7-구현-상세)
8. [엣지 케이스 처리](#8-엣지-케이스-처리)
9. [검증 및 테스트](#9-검증-및-테스트)
10. [참고 자료](#10-참고-자료)

---

## 1. 페이지 개요

### 1.1 목적

사용자가 구독 상태를 조회하고, Pro 구독 결제, 구독 취소, 재활성화를 할 수 있는 통합 관리 페이지

### 1.2 주요 유스케이스

| UseCase ID | UseCase 명 | 설명 |
|-----------|-----------|------|
| UF-02 | Pro 구독 전환 | 무료 사용자가 Pro 구독 결제 |
| UF-04 | 구독 취소 및 재활성화 | Pro 사용자가 구독 취소 또는 재활성화 |

### 1.3 접근 권한

- **인증**: Clerk 로그인 필수
- **권한**: 본인 구독 정보만 조회/수정 가능
- **리다이렉트**: 비로그인 시 `/login` 페이지로 이동

### 1.4 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| **무료→Pro 전환율** | 15% | (Pro 구독자 수 ÷ 무료 가입자 수) × 100 |
| **구독 취소율** | < 20% | 월간 취소 수 ÷ 전체 Pro 구독자 수 |
| **재활성화율** | > 30% | 재활성화 수 ÷ 취소 수 |
| **페이지 로딩 시간** | < 1초 | Vercel Analytics |

---

## 2. 기능 요구사항

### 2.1 구독 상태 조회

**기능 설명**: 현재 사용자의 구독 정보 표시

**표시 항목**:
- 현재 플랜: "무료 체험" 또는 "Pro 구독 중"
- 남은 쿼터: "X회 / 총 Y회"
- 다음 결제일: "YYYY-MM-DD" (Pro만)
- 결제 금액: "9,900원" (Pro만)
- 결제 수단: "**** **** **** 1234" (마스킹, Pro만)
- 구독 상태: "활성" / "취소 예정" / "해지됨"

**데이터 소스**:
```sql
SELECT
  plan_type,
  status,
  quota,
  next_payment_date,
  last_payment_date,
  billing_key
FROM subscriptions
WHERE clerk_user_id = :userId;
```

---

### 2.2 Pro 구독 시작 (무료 → Pro 전환)

**트리거**: 무료 사용자가 "Pro 구독 시작" 버튼 클릭

**플로우**:
1. 토스 결제 위젯 모달 열기
2. 카드 정보 입력
3. BillingKey 발급 (토스 서버)
4. 첫 결제 실행 (9,900원)
5. Supabase 구독 정보 업데이트
6. 대시보드로 리다이렉트

**성공 조건**:
- 결제 성공 (`status: 'DONE'`)
- `plan_type`이 'pro'로 변경
- `quota`가 10으로 리셋
- `billing_key` 저장
- `next_payment_date` 설정 (+1개월)

**실패 처리**:
- 카드 정보 오류: "카드 정보를 확인해주세요"
- 잔액 부족: "카드 잔액이 부족합니다"
- 결제 거부: "카드사에서 결제를 거부했습니다"
- BillingKey 발급 실패: 롤백 처리

**참고 문서**: `/docs/usecases/2-pro-subscription/spec.md`

---

### 2.3 구독 취소

**트리거**: Pro 사용자가 "구독 취소" 버튼 클릭

**플로우**:
1. 취소 확인 모달 표시
2. 사용자가 "확인" 클릭
3. `POST /api/subscription/cancel` 호출
4. `status`를 'cancelled'로 변경
5. `cancelled_at` 기록
6. Toast 알림: "구독이 취소되었습니다. YYYY-MM-DD까지 Pro 혜택이 유지됩니다"
7. "구독 취소" 버튼 → "취소 철회" 버튼으로 변경

**중요 정책**:
- **BillingKey 유지**: 재활성화 가능하도록 BillingKey는 삭제하지 않음
- **Pro 혜택 유지**: 다음 결제일까지 Pro 기능 계속 사용 가능
- **자동 해지**: 결제일 도래 시 Supabase Cron이 자동 해지 처리

**참고 문서**: `/docs/usecases/4-subscription-management/spec.md`

---

### 2.4 구독 재활성화

**트리거**: 취소 예정 상태 사용자가 "취소 철회" 버튼 클릭

**조건**:
- `status === 'cancelled'`
- `next_payment_date > 현재 날짜` (결제일 전까지만 가능)

**플로우**:
1. 재활성화 확인 모달 표시
2. 사용자가 "확인" 클릭
3. `POST /api/subscription/reactivate` 호출
4. `status`를 'active'로 변경
5. `cancelled_at`을 NULL로 초기화
6. Toast 알림: "구독이 재활성화되었습니다"
7. "취소 철회" 버튼 → "구독 취소" 버튼으로 변경

**제한 사항**:
- 결제일 이후에는 재활성화 불가 (새로 구독해야 함)
- 이미 해지된 구독(`status: 'terminated'`)은 재활성화 불가

---

### 2.5 결제 내역 조회 (선택 사항, P1)

**기능 설명**: 최근 12개월 결제 이력 표시

**표시 항목**:
- 결제일자
- 결제 금액
- 결제 상태 (성공/실패)
- 결제 수단

**데이터 소스**: 별도 `payment_history` 테이블 (향후 추가)

---

## 3. UI/UX 설계

### 3.1 페이지 레이아웃

```
┌─────────────────────────────────────────────────┐
│ Header (공통)                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  📄 구독 관리                                     │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 현재 구독 정보                              │ │
│  │ ─────────────────────────────────────────│ │
│  │ 플랜: Pro 구독 중                          │ │
│  │ 남은 쿼터: 8회 / 10회                      │ │
│  │ 다음 결제일: 2025-11-26                    │ │
│  │ 결제 금액: 9,900원                         │ │
│  │ 결제 수단: **** **** **** 1234             │ │
│  │                                           │ │
│  │ [구독 취소]                                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  (또는)                                          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ⚠️ 구독 취소 예정                           │ │
│  │ ─────────────────────────────────────────│ │
│  │ 해지일: 2025-11-26                         │ │
│  │ 안내: 해지일까지 Pro 혜택이 유지됩니다       │ │
│  │                                           │ │
│  │ [취소 철회]                                │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  (또는)                                          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 무료 체험                                  │ │
│  │ ─────────────────────────────────────────│ │
│  │ 남은 쿼터: 0회 / 3회                       │ │
│  │                                           │ │
│  │ [Pro 구독 시작]                            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Pro 플랜 안내                              │ │
│  │ ─────────────────────────────────────────│ │
│  │ 월 9,900원                                │ │
│  │ ✅ 월 10회 사주 분석                       │ │
│  │ ✅ Gemini 2.5 Pro 모델 사용               │ │
│  │ ✅ 분석 이력 무제한 보관                   │ │
│  │ ✅ 언제든 해지 가능                        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 3.2 상태별 UI 변화

#### 상태 1: 무료 사용자 (`plan_type: 'free'`)

**표시 내용**:
- 현재 플랜: "무료 체험"
- 남은 쿼터: "X회 / 3회"
- CTA 버튼: "Pro 구독 시작" (보라색 강조)

**Pro 플랜 안내 카드**:
- 가격: "월 9,900원"
- 혜택 리스트 (체크 아이콘)

---

#### 상태 2: Pro 활성 사용자 (`plan_type: 'pro'`, `status: 'active'`)

**표시 내용**:
- 현재 플랜: "Pro 구독 중" (✅ 아이콘)
- 남은 쿼터: "X회 / 10회"
- 다음 결제일: "2025-11-26"
- 결제 금액: "9,900원"
- 결제 수단: "**** **** **** 1234"
- 액션 버튼: "구독 취소" (회색, Ghost 스타일)

---

#### 상태 3: 취소 예정 사용자 (`status: 'cancelled'`)

**표시 내용**:
- 상태 배지: "⚠️ 구독 취소 예정" (주황색)
- 해지일: "2025-11-26"
- 안내 문구: "해지일까지 Pro 혜택이 유지됩니다"
- 남은 쿼터: "X회 / 10회"
- 액션 버튼: "취소 철회" (보라색 강조)

---

#### 상태 4: 해지된 사용자 (`status: 'terminated'`)

**표시 내용**:
- 상태 배지: "❌ 구독 해지됨" (빨간색)
- 안내 문구: "이전 구독이 해지되었습니다"
- 남은 쿼터: "0회 / 0회"
- CTA 버튼: "Pro 구독 시작" (새로 구독)

---

### 3.3 모달 UI

#### 구독 취소 확인 모달

```
┌───────────────────────────────────────┐
│ ❓ 구독을 취소하시겠습니까?            │
├───────────────────────────────────────┤
│                                       │
│ • 다음 결제일(2025-11-26)까지 Pro      │
│   혜택이 유지됩니다.                   │
│                                       │
│ • 결제일 전까지는 언제든 취소를        │
│   철회할 수 있습니다.                  │
│                                       │
│ • 결제일 이후에는 자동으로 해지되며,   │
│   재구독 시 BillingKey가 재발급됩니다. │
│                                       │
│           [취소]     [확인]            │
└───────────────────────────────────────┘
```

---

#### 재활성화 확인 모달

```
┌───────────────────────────────────────┐
│ ♻️ 구독을 재활성화하시겠습니까?        │
├───────────────────────────────────────┤
│                                       │
│ • 다음 결제일(2025-11-26)에 정기       │
│   결제가 재개됩니다.                   │
│                                       │
│ • 결제 금액: 9,900원                  │
│ • 결제 수단: **** **** **** 1234       │
│                                       │
│           [취소]     [확인]            │
└───────────────────────────────────────┘
```

---

#### Pro 구독 시작 (토스 결제 위젯)

**토스 SDK 사용**:
- 토스 결제 위젯이 모달 형태로 열림
- 카드 정보 입력 폼 (토스 제공)
- 약관 동의 체크박스
- "결제하기" 버튼

**참고**: 토스 위젯 UI는 토스페이먼츠에서 제공하는 기본 UI 사용

---

## 4. 상태 관리

### 4.1 클라이언트 상태 (React State)

```typescript
// /app/subscription/page.tsx
interface SubscriptionPageState {
  // 데이터 상태
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;

  // UI 상태
  isSubscribing: boolean;
  isCancelling: boolean;
  isReactivating: boolean;
  showCancelModal: boolean;
  showReactivateModal: boolean;
}

interface Subscription {
  clerkUserId: string;
  planType: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'terminated';
  quota: number;
  nextPaymentDate: string | null;
  lastPaymentDate: string | null;
  billingKey: string | null;
  cancelledAt: string | null;
}
```

---

### 4.2 서버 상태 (Supabase)

**테이블**: `subscriptions`

**컬럼**:
- `clerk_user_id` (TEXT, PRIMARY KEY)
- `plan_type` (TEXT, 'free' | 'pro')
- `status` (TEXT, 'active' | 'cancelled' | 'terminated')
- `quota` (INTEGER)
- `billing_key` (TEXT, NULL 가능)
- `next_payment_date` (DATE, NULL 가능)
- `last_payment_date` (DATE, NULL 가능)
- `cancelled_at` (TIMESTAMP, NULL 가능)

---

### 4.3 상태 전이 다이어그램

```
[무료 사용자 (Free)]
      ↓ Pro 구독 시작 (결제 성공)
[Pro 활성 (Active)]
      ↓ 구독 취소
[취소 예정 (Cancelled)]
      ↓ (2가지 경로)
      ├─ 취소 철회 → [Pro 활성 (Active)]
      └─ 결제일 도래 → [해지됨 (Terminated)]

[해지됨 (Terminated)]
      ↓ 새로 구독 시작
[Pro 활성 (Active)]
```

---

## 5. API 연동

### 5.1 구독 정보 조회 API

**엔드포인트**: `GET /api/subscription/status`

**요청**:
```typescript
// Headers
{
  "Authorization": "Bearer <clerk-session-token>"
}
```

**응답 (성공)**:
```json
{
  "success": true,
  "data": {
    "clerkUserId": "user_2abc123xyz",
    "planType": "pro",
    "status": "active",
    "quota": 8,
    "nextPaymentDate": "2025-11-26",
    "lastPaymentDate": "2025-10-26",
    "billingKey": "billing_***xyz",
    "cancelledAt": null
  }
}
```

**응답 (무료 사용자)**:
```json
{
  "success": true,
  "data": {
    "clerkUserId": "user_2abc123xyz",
    "planType": "free",
    "status": "active",
    "quota": 0,
    "nextPaymentDate": null,
    "lastPaymentDate": null,
    "billingKey": null,
    "cancelledAt": null
  }
}
```

**에러**:
- 401 Unauthorized: 로그인 필요
- 404 Not Found: 구독 정보 없음
- 500 Internal Server Error: 서버 오류

---

### 5.2 Pro 구독 시작 API

**엔드포인트**: `POST /api/subscription/subscribe`

**요청**:
```json
{
  "billingKey": "billing_abc123xyz",
  "customerKey": "user_2abc123xyz"
}
```

**응답 (성공)**:
```json
{
  "success": true,
  "message": "Pro 구독이 시작되었습니다",
  "data": {
    "clerkUserId": "user_2abc123xyz",
    "planType": "pro",
    "quota": 10,
    "nextPaymentDate": "2025-11-26",
    "lastPaymentDate": "2025-10-26"
  }
}
```

**에러**:
- 400 Bad Request: 이미 Pro 구독 중
- 400 Bad Request: 결제 실패
- 401 Unauthorized: 로그인 필요
- 500 Internal Server Error: 서버 오류

**참고 문서**: `/docs/usecases/2-pro-subscription/spec.md` - 섹션 9

---

### 5.3 구독 취소 API

**엔드포인트**: `POST /api/subscription/cancel`

**요청**:
```json
// Body 없음 (userId는 세션에서 추출)
```

**응답 (성공)**:
```json
{
  "success": true,
  "message": "구독이 취소되었습니다. 2025-11-26까지 Pro 혜택이 유지됩니다.",
  "data": {
    "status": "cancelled",
    "cancelledAt": "2025-10-26T15:30:00Z",
    "nextPaymentDate": "2025-11-26"
  }
}
```

**에러**:
- 400 Bad Request: 이미 취소된 구독
- 400 Bad Request: 구독 중인 플랜이 없음
- 401 Unauthorized: 로그인 필요
- 500 Internal Server Error: 서버 오류

**참고 문서**: `/docs/usecases/4-subscription-management/spec.md` - 섹션 9

---

### 5.4 구독 재활성화 API

**엔드포인트**: `POST /api/subscription/reactivate`

**요청**:
```json
// Body 없음 (userId는 세션에서 추출)
```

**응답 (성공)**:
```json
{
  "success": true,
  "message": "구독이 재활성화되었습니다.",
  "data": {
    "status": "active",
    "cancelledAt": null,
    "nextPaymentDate": "2025-11-26"
  }
}
```

**에러**:
- 400 Bad Request: 결제일 이후 재활성화 불가
- 400 Bad Request: 해지된 구독은 재활성화 불가
- 401 Unauthorized: 로그인 필요
- 500 Internal Server Error: 서버 오류

---

## 6. 컴포넌트 구조

### 6.1 페이지 컴포넌트 계층

```
SubscriptionPage (app/subscription/page.tsx)
├── SubscriptionStatusCard (컴포넌트)
│   ├── FreePlanCard (무료 플랜 표시)
│   ├── ProActivePlanCard (Pro 활성 표시)
│   ├── ProCancelledPlanCard (취소 예정 표시)
│   └── TerminatedPlanCard (해지됨 표시)
├── ProPlanInfoCard (Pro 플랜 안내)
├── CancelConfirmModal (취소 확인 모달)
├── ReactivateConfirmModal (재활성화 확인 모달)
└── TossPaymentWidget (토스 결제 위젯 래퍼)
```

---

### 6.2 파일 구조

```
src/
├── app/
│   └── subscription/
│       ├── page.tsx                        # 메인 페이지 (Client Component)
│       └── loading.tsx                     # 로딩 Skeleton
│
├── features/
│   └── subscription/
│       ├── components/
│       │   ├── subscription-status-card.tsx
│       │   ├── free-plan-card.tsx
│       │   ├── pro-active-plan-card.tsx
│       │   ├── pro-cancelled-plan-card.tsx
│       │   ├── terminated-plan-card.tsx
│       │   ├── pro-plan-info-card.tsx
│       │   ├── cancel-confirm-modal.tsx
│       │   ├── reactivate-confirm-modal.tsx
│       │   └── toss-payment-widget.tsx
│       ├── hooks/
│       │   ├── use-subscription-status.ts  # 구독 정보 조회 훅
│       │   ├── use-subscribe.ts            # Pro 구독 훅
│       │   ├── use-cancel.ts               # 구독 취소 훅
│       │   └── use-reactivate.ts           # 재활성화 훅
│       ├── lib/
│       │   └── dto.ts                      # 스키마 재노출
│       └── backend/
│           ├── route.ts                    # Hono 라우터
│           ├── service.ts                  # 비즈니스 로직
│           ├── schema.ts                   # Zod 스키마
│           └── error.ts                    # 에러 코드
│
└── lib/
    └── toss-payments/
        ├── client.ts                       # 토스 API 클라이언트
        └── types.ts                        # 토스 타입 정의
```

---

## 7. 구현 상세

### 7.1 페이지 컴포넌트 (`page.tsx`)

```typescript
// src/app/subscription/page.tsx
'use client';

import { useSubscriptionStatus } from '@/features/subscription/hooks/use-subscription-status';
import { SubscriptionStatusCard } from '@/features/subscription/components/subscription-status-card';
import { ProPlanInfoCard } from '@/features/subscription/components/pro-plan-info-card';

export default function SubscriptionPage() {
  const { subscription, isLoading, error } = useSubscriptionStatus();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">구독 관리</h1>

      <div className="space-y-6">
        <SubscriptionStatusCard subscription={subscription} />

        {subscription.planType === 'free' && (
          <ProPlanInfoCard />
        )}
      </div>
    </div>
  );
}
```

---

### 7.2 구독 정보 조회 훅 (`use-subscription-status.ts`)

```typescript
// src/features/subscription/hooks/use-subscription-status.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/remote/api-client';
import type { Subscription } from '../lib/dto';

export function useSubscriptionStatus() {
  const { userId } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!userId) {
        setError('로그인이 필요합니다');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/api/subscription/status');
        setSubscription(response.data.data);
      } catch (err) {
        setError('구독 정보를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  return { subscription, isLoading, error };
}
```

---

### 7.3 Pro 구독 훅 (`use-subscribe.ts`)

```typescript
// src/features/subscription/hooks/use-subscribe.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from 'sonner';

export function useSubscribe() {
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState(false);

  async function subscribe(billingKey: string, customerKey: string) {
    setIsSubscribing(true);

    try {
      const response = await apiClient.post('/api/subscription/subscribe', {
        billingKey,
        customerKey,
      });

      toast.success('Pro 구독이 시작되었습니다! 이제 월 10회 분석을 이용하실 수 있습니다.');
      router.push('/dashboard');
    } catch (error) {
      const message = error?.response?.data?.error || '결제에 실패했습니다. 다시 시도해주세요.';
      toast.error(message);
      throw error;
    } finally {
      setIsSubscribing(false);
    }
  }

  return { subscribe, isSubscribing };
}
```

---

### 7.4 구독 취소 훅 (`use-cancel.ts`)

```typescript
// src/features/subscription/hooks/use-cancel.ts
import { useState } from 'react';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from 'sonner';

export function useCancel() {
  const [isCancelling, setIsCancelling] = useState(false);

  async function cancel() {
    setIsCancelling(true);

    try {
      const response = await apiClient.post('/api/subscription/cancel');
      const { message, data } = response.data;

      toast.success(message);
      return data;
    } catch (error) {
      const message = error?.response?.data?.error || '구독 취소 중 오류가 발생했습니다.';
      toast.error(message);
      throw error;
    } finally {
      setIsCancelling(false);
    }
  }

  return { cancel, isCancelling };
}
```

---

### 7.5 재활성화 훅 (`use-reactivate.ts`)

```typescript
// src/features/subscription/hooks/use-reactivate.ts
import { useState } from 'react';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from 'sonner';

export function useReactivate() {
  const [isReactivating, setIsReactivating] = useState(false);

  async function reactivate() {
    setIsReactivating(true);

    try {
      const response = await apiClient.post('/api/subscription/reactivate');
      const { message, data } = response.data;

      toast.success(message);
      return data;
    } catch (error) {
      const message = error?.response?.data?.error || '구독 재활성화 중 오류가 발생했습니다.';
      toast.error(message);
      throw error;
    } finally {
      setIsReactivating(false);
    }
  }

  return { reactivate, isReactivating };
}
```

---

### 7.6 토스 결제 위젯 래퍼 (`toss-payment-widget.tsx`)

```typescript
// src/features/subscription/components/toss-payment-widget.tsx
'use client';

import { useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useAuth } from '@clerk/nextjs';
import { useSubscribe } from '../hooks/use-subscribe';

interface TossPaymentWidgetProps {
  onClose: () => void;
}

export function TossPaymentWidget({ onClose }: TossPaymentWidgetProps) {
  const { userId } = useAuth();
  const { subscribe, isSubscribing } = useSubscribe();

  useEffect(() => {
    async function loadWidget() {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const tossPayments = await loadTossPayments(clientKey);

      const widget = tossPayments.widgets({ customerKey: userId! });

      await widget.requestBillingAuth({
        method: '카드',
        successUrl: window.location.origin + '/subscription/success',
        failUrl: window.location.origin + '/subscription/fail',
      });

      // 성공 콜백 (URL 파라미터에서 billingKey 추출)
      const urlParams = new URLSearchParams(window.location.search);
      const billingKey = urlParams.get('billingKey');
      const customerKey = urlParams.get('customerKey');

      if (billingKey && customerKey) {
        await subscribe(billingKey, customerKey);
      }
    }

    loadWidget();
  }, [userId, subscribe]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Pro 구독 결제</h2>
        <div id="toss-payment-widget" />
        <button onClick={onClose} className="mt-4">취소</button>
      </div>
    </div>
  );
}
```

**참고**: 실제 토스 위젯 통합은 토스페이먼츠 공식 문서 참고

---

### 7.7 백엔드 라우터 (`route.ts`)

```typescript
// src/features/subscription/backend/route.ts
import { Hono } from 'hono';
import type { AppEnv } from '@/backend/hono/context';
import { withClerkAuth } from '@/backend/middleware/clerk';
import { SubscriptionService } from './service';
import { subscribeSchema, statusResponseSchema } from './schema';

export const subscriptionRoutes = new Hono<AppEnv>()
  .use('*', withClerkAuth())

  // 구독 정보 조회
  .get('/status', async (c) => {
    const userId = c.get('clerkUserId');
    const service = new SubscriptionService(c.get('supabase'));

    const subscription = await service.getSubscriptionStatus(userId);

    return c.json({
      success: true,
      data: statusResponseSchema.parse(subscription),
    });
  })

  // Pro 구독 시작
  .post('/subscribe', async (c) => {
    const userId = c.get('clerkUserId');
    const body = await c.req.json();
    const { billingKey, customerKey } = subscribeSchema.parse(body);

    const service = new SubscriptionService(c.get('supabase'));
    const result = await service.subscribe(userId, billingKey, customerKey);

    return c.json({
      success: true,
      message: 'Pro 구독이 시작되었습니다',
      data: result,
    });
  })

  // 구독 취소
  .post('/cancel', async (c) => {
    const userId = c.get('clerkUserId');
    const service = new SubscriptionService(c.get('supabase'));

    const result = await service.cancel(userId);

    return c.json({
      success: true,
      message: `구독이 취소되었습니다. ${result.nextPaymentDate}까지 Pro 혜택이 유지됩니다.`,
      data: result,
    });
  })

  // 구독 재활성화
  .post('/reactivate', async (c) => {
    const userId = c.get('clerkUserId');
    const service = new SubscriptionService(c.get('supabase'));

    const result = await service.reactivate(userId);

    return c.json({
      success: true,
      message: '구독이 재활성화되었습니다.',
      data: result,
    });
  });
```

---

### 7.8 백엔드 서비스 (`service.ts`)

```typescript
// src/features/subscription/backend/service.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { tossPayments } from '@/lib/toss-payments/client';
import { SubscriptionError } from './error';

export class SubscriptionService {
  constructor(private supabase: SupabaseClient) {}

  async getSubscriptionStatus(userId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) throw new SubscriptionError('SUBSCRIPTION_NOT_FOUND');

    return data;
  }

  async subscribe(userId: string, billingKey: string, customerKey: string) {
    // 1. 현재 구독 확인
    const current = await this.getSubscriptionStatus(userId);
    if (current.plan_type === 'pro') {
      throw new SubscriptionError('ALREADY_SUBSCRIBED');
    }

    // 2. 첫 결제 실행
    try {
      const payment = await tossPayments.chargeBilling({
        billingKey,
        amount: 9900,
        orderName: '사주분석 Pro 구독',
        customerEmail: customerKey,
        customerName: '사용자',
      });

      if (payment.status !== 'DONE') {
        throw new Error('결제 실패');
      }
    } catch (error) {
      // 결제 실패 시 BillingKey 삭제
      await tossPayments.deleteBillingKey(billingKey);
      throw new SubscriptionError('PAYMENT_FAILED');
    }

    // 3. 구독 정보 업데이트
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        plan_type: 'pro',
        quota: 10,
        billing_key: billingKey,
        next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        last_payment_date: new Date().toISOString().split('T')[0],
      })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) throw new SubscriptionError('UPDATE_FAILED');

    return data;
  }

  async cancel(userId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)
      .eq('status', 'active')
      .select()
      .single();

    if (error || !data) throw new SubscriptionError('CANCEL_FAILED');

    return data;
  }

  async reactivate(userId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .update({
        status: 'active',
        cancelled_at: null,
      })
      .eq('clerk_user_id', userId)
      .eq('status', 'cancelled')
      .gt('next_payment_date', new Date().toISOString().split('T')[0])
      .select()
      .single();

    if (error || !data) throw new SubscriptionError('REACTIVATE_FAILED');

    return data;
  }
}
```

---

## 8. 엣지 케이스 처리

### 8.1 결제 실패 시 롤백

**상황**: BillingKey 발급 성공 후 첫 결제 실패

**처리**:
1. BillingKey 즉시 삭제 (`tossPayments.deleteBillingKey()`)
2. Supabase 구독 정보 롤백 (plan_type: 'free' 유지)
3. 사용자에게 명확한 에러 메시지 표시

**코드**: `service.ts` - `subscribe()` 메서드의 catch 블록

---

### 8.2 이미 Pro 구독 중인 사용자

**상황**: Pro 상태에서 재구독 시도

**처리**:
1. API 검증에서 차단 (`plan_type === 'pro'`)
2. 에러 응답: `ALREADY_SUBSCRIBED`
3. 프론트엔드에서 "Pro 구독 시작" 버튼 숨김 (UI 방어)

---

### 8.3 결제일 이후 재활성화 시도

**상황**: `next_payment_date`가 지난 후 재활성화 시도

**처리**:
1. SQL 조건 실패 (`WHERE next_payment_date > CURRENT_DATE`)
2. 에러 응답: `REACTIVATE_FAILED`
3. 메시지: "구독 기간이 만료되어 재활성화할 수 없습니다"
4. "새로 구독하기" 버튼 표시

---

### 8.4 동시 요청 (Race Condition)

**상황**: 사용자가 버튼 중복 클릭

**처리**:
1. 프론트엔드 방어:
   - `isLoading` 상태로 버튼 비활성화
   - 요청 중일 때 `disabled={isLoading}`
2. 백엔드 방어:
   - SQL `WHERE` 조건으로 중복 처리 방지
   - 예: `WHERE plan_type = 'free'` (이미 Pro면 조건 실패)

---

### 8.5 네트워크 오류

**상황**: API 호출 중 네트워크 연결 끊김

**처리**:
1. Toast 에러: "인터넷 연결을 확인해주세요"
2. "다시 시도" 버튼 제공
3. 자동 재시도 없음 (사용자 의도 불명확)

---

## 9. 검증 및 테스트

### 9.1 단위 테스트

#### TC-01: 구독 정보 조회 성공
- **Given**: 로그인된 사용자
- **When**: `/api/subscription/status` GET 요청
- **Then**: 200 OK, 구독 정보 반환

#### TC-02: Pro 구독 시작 성공
- **Given**: 무료 사용자, 유효한 BillingKey
- **When**: `/api/subscription/subscribe` POST 요청
- **Then**: 200 OK, plan_type='pro', quota=10

#### TC-03: 구독 취소 성공
- **Given**: Pro 활성 사용자
- **When**: `/api/subscription/cancel` POST 요청
- **Then**: 200 OK, status='cancelled', cancelled_at 기록

#### TC-04: 구독 재활성화 성공
- **Given**: 취소 예정 사용자 (next_payment_date > 오늘)
- **When**: `/api/subscription/reactivate` POST 요청
- **Then**: 200 OK, status='active', cancelled_at=NULL

---

### 9.2 통합 테스트

#### IT-01: 무료 → Pro 전환 → 취소 → 재활성화
1. 무료 사용자 로그인
2. Pro 구독 시작 (결제 성공)
3. 상태 확인: plan_type='pro', quota=10
4. 구독 취소
5. 상태 확인: status='cancelled'
6. 재활성화
7. 상태 확인: status='active'

#### IT-02: 결제 실패 시 롤백
1. 무료 사용자 로그인
2. Pro 구독 시도 (잔액 부족 카드)
3. BillingKey 발급 성공
4. 첫 결제 실패
5. BillingKey 삭제 확인
6. 상태 확인: plan_type='free' 유지

---

### 9.3 E2E 테스트

#### E2E-01: 전체 사용자 플로우
1. 브라우저에서 로그인
2. `/subscription` 접속
3. 무료 플랜 카드 확인
4. "Pro 구독 시작" 버튼 클릭
5. 토스 위젯 모달 확인
6. 카드 정보 입력 (테스트 카드)
7. 결제 완료
8. Toast 알림 확인
9. 대시보드 리다이렉트 확인
10. 남은 쿼터 10회 확인

---

### 9.4 접근성 테스트

- [ ] 키보드 네비게이션 (Tab 키)
- [ ] 스크린 리더 (NVDA, VoiceOver)
- [ ] 색상 대비 (WCAG AA)
- [ ] 포커스 인디케이터 표시

---

## 10. 참고 자료

### 10.1 관련 문서

- **PRD**: `/docs/prd.md` - 페이지 요구사항 (3.2.5 섹션)
- **Userflow**: `/docs/userflow.md` - UF-02, UF-04
- **UseCase - Pro 구독**: `/docs/usecases/2-pro-subscription/spec.md`
- **UseCase - 구독 관리**: `/docs/usecases/4-subscription-management/spec.md`
- **Common Modules**: `/docs/common-modules.md` - 토스페이먼츠 클라이언트

---

### 10.2 외부 문서

- [Toss Payments 정기결제 가이드](https://docs.tosspayments.com/guides/billing)
- [Toss Payments 위젯 SDK](https://docs.tosspayments.com/reference/widget-sdk)
- [Clerk React Hooks](https://clerk.com/docs/references/react/use-auth)
- [Shadcn UI Dialog](https://ui.shadcn.com/docs/components/dialog)

---

### 10.3 의존 공통 모듈

| 모듈 | 경로 | 상태 |
|------|------|------|
| 토스페이먼츠 클라이언트 | `src/lib/toss-payments/client.ts` | 구현 필요 |
| Clerk 서버 미들웨어 | `src/backend/middleware/clerk.ts` | 구현 필요 |
| 에러 메시지 상수 | `src/constants/messages.ts` | 구현 필요 |
| API 클라이언트 | `src/lib/remote/api-client.ts` | 기존 존재 |
| Supabase 클라이언트 | `src/lib/supabase/` | 기존 존재 |

---

## 11. 구현 순서

### Phase 1: 백엔드 구현 (1일)
1. 토스페이먼츠 클라이언트 구현
2. 백엔드 라우터 및 서비스 구현
3. Zod 스키마 정의
4. 에러 핸들링

### Phase 2: 프론트엔드 훅 (0.5일)
5. `use-subscription-status.ts`
6. `use-subscribe.ts`
7. `use-cancel.ts`
8. `use-reactivate.ts`

### Phase 3: UI 컴포넌트 (1일)
9. 상태별 카드 컴포넌트
10. 모달 컴포넌트
11. 토스 위젯 래퍼

### Phase 4: 페이지 통합 (0.5일)
12. 페이지 컴포넌트 통합
13. 로딩/에러 상태 처리
14. 스타일링 및 반응형 대응

### Phase 5: 테스트 및 검증 (1일)
15. 단위 테스트
16. 통합 테스트
17. E2E 테스트
18. 접근성 검증

**총 예상 시간**: 4일

---

## 12. 체크리스트

### 구현 전 체크
- [ ] 공통 모듈 구현 완료 (토스페이먼츠 클라이언트)
- [ ] Clerk 미들웨어 구현 완료
- [ ] 환경 변수 설정 완료
- [ ] Supabase `subscriptions` 테이블 스키마 확인

### 구현 중 체크
- [ ] TypeScript strict mode 준수
- [ ] Zod 스키마 검증
- [ ] 에러 핸들링 (try-catch)
- [ ] 로딩 상태 표시
- [ ] Toast 알림 표시

### 구현 후 체크
- [ ] 모든 상태 전이 정상 작동
- [ ] 결제 실패 시 롤백 확인
- [ ] 접근성 검증 통과
- [ ] TypeScript 빌드 성공
- [ ] ESLint 검증 통과

---

**문서 버전**: 1.0
**최종 수정일**: 2025-10-26
**작성자**: Claude Code
**검토자**: -
**승인 상태**: Draft
