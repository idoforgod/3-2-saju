# 📄 Requirement Specification: 구독제 사주분석 서비스

## 1. 프로젝트 개요

본 프로젝트는 **EasyNext 업그레이드 템플릿**을 기반으로,  
**Clerk**, **Supabase**, **토스페이먼츠**, **Gemini API**를 통합하여  
사용자 인증, 구독결제, AI 사주분석을 제공하는 **Next.js + Flux 아키텍처 기반 SaaS 서비스**입니다.

- **서비스명:** 구독제 사주분석 서비스  
- **Base Template:** EasyNext (Upgraded)
- **배포 환경:** Vercel  
- **핵심 목표:** Flux 단방향 데이터 흐름 기반의 상태 일관성 확보  
- **주요 SDK:** Clerk (Auth + Webhook), Supabase (DB & Cron), TossPayments (결제), Gemini (AI 분석)

> 📌 **아키텍처 노트**:  
> EasyNext 템플릿은 Supabase Auth를 기본 제공하지만, VibeCoding 평가에서 Clerk 사용이 필수 조건이므로  
> 인증은 Clerk로 구현하고, Supabase는 데이터베이스와 Cron 기능만 활용합니다.

---

## 2. 핵심 기능 요약 (VibeCoding 평가 항목)

| 기능 영역 | 설명 | 연동 기술/서비스 | 평가 통과 조건 |
|------------|------|------------------|----------------|
| **인증 (Auth)** | Google OAuth 로그인 / 세션 관리 | Clerk SDK + Webhook | ✅ 오류 없이 연동 |
| **결제 (Payment)** | 정기 구독 결제 플로우 (BillingKey, 해지, 재발급) | Toss Payments API | ✅ 오류 없이 연동 |
| **사주 분석 (Analysis)** | Gemini API를 이용한 사주 분석 자동화 | Gemini 2.5 Flash / Pro | ✅ 오류 없이 연동 |
| **구독 관리 (Subscription)** | 구독 상태 조회, 갱신, 해지, 재활성화 처리 | Supabase + Toss | ✅ 정책 준수 |
| **정기 결제 트리거** | 매일 02:00 Cron → 결제 자동 실행 | Supabase Cron + Next.js API | ✅ 정상 작동 |

---

## 3. 페이지 구조 (필수 5개 페이지)

| 페이지명 | 경로 | 접근 조건 | 주요 기능 | 구현 방식 |
|-----------|------|-----------|-----------|----------|
| **홈 (Landing)** | `/` | 전체 공개 | 서비스 소개, 로그인 유도 | 커스텀 페이지 |
| **대시보드** | `/dashboard` | 로그인 필요 | 분석 이력 조회 | 커스텀 페이지 |
| **새 분석하기** | `/analysis/new` | 로그인 + 쿼터 필요 | Gemini API 호출 및 결과 표시 | 커스텀 페이지 |
| **분석 상세보기** | `/analysis/[id]` | 로그인 필요 | 과거 분석 결과 상세 조회 | 커스텀 페이지 |
| **구독 관리** | `/subscription` | 로그인 필요 | 구독 상태 조회, 해지, 재활성화 | 커스텀 페이지 |

> 💡 **인증 관련 페이지**: Clerk SDK에서 제공하는 기본 컴포넌트(`<SignIn />`, `<SignUp />`, `<UserProfile />`)를 그대로 사용합니다.

---

## 4. 구독 정책 (VibeCoding 평가 핵심)

| 구분 | 조건 | 쿼터 | 사용 모델 | 세부 규칙 |
|------|------|------|-----------|----------|
| **무료 체험 (Free)** | 최초 가입 | 총 3회 | `gemini-2.5-flash` | 3회 소진 후 Pro 구독 필요 |
| **Pro 구독자 (Paid)** | 월 구독 결제 | 월 10회 | `gemini-2.5-pro` | 매월 결제일에 쿼터 리셋 |
| **Pro 구독 취소** | 사용자 요청 | - | - | 다음 결제일까지 Pro 상태 유지 |
| **Pro 취소 재활성화** | 결제일 전까지 | - | - | 취소 상태를 철회하여 구독 유지 가능 |
| **구독 해지** | 결제 실패 또는 명시적 해지 | - | - | BillingKey 즉시 삭제, 재구독 시 SDK로 재발급 |

### 📌 구독 정책 상세 플로우

```
[무료 가입] → 3회 테스트 가능
              ↓ (3회 소진)
[Pro 구독] → 월 10회 테스트 가능
              ↓
[구독 취소 요청] → 다음 결제일까지 Pro 유지
              ↓
[결제일 전 재활성화 가능] ← 취소 철회
              ↓ (결제일 도래)
[결제 성공] → 구독 연장 + 쿼터 리셋
[결제 실패] → 즉시 해지 + BillingKey 삭제
```

---

## 5. 기술 스택

| 구성 요소 | 기술 | 버전/설정 | 비고 |
|------------|------|-----------|------|
| **Base Template** | EasyNext (Upgraded) | Latest | 프로젝트 초기 구조 제공 |
| **Framework** | Next.js (App Router) | 14.x | - |
| **Language** | TypeScript | 5.x | - |
| **Auth** | Clerk SDK + Webhook | Latest | ⚠️ **통과 조건 강제** (Supabase Auth 미사용) |
| **Database** | Supabase (PostgreSQL) | Latest | 인증은 Clerk 사용, DB 기능만 활용 |
| **Payment** | Toss Payments API | v1 | - |
| **Scheduler** | Supabase Cron | 매일 02:00 KST | - |
| **AI Model** | Gemini 2.5 Flash / Pro | Latest API | Free: Flash, Pro: Pro |
| **State Management** | Context API (권장) / Flux (선택) | - | 간단한 Context API로 충분, Flux는 가산점 |
| **Deployment** | Vercel | - | - |

> ⚠️ **중요 아키텍처 결정**:  
> EasyNext 템플릿은 Supabase Auth를 기본 제공하지만, VibeCoding 평가 기준에서 **Clerk SDK/Webhook 사용을 강제**하므로  
> **인증은 Clerk를 사용**하고, Supabase는 **데이터베이스 기능만** 활용합니다.

---

## 6. 상태 관리 설계

> ⚠️ **중요**: 이 섹션은 **가산점 요소**입니다. 평가 통과를 위한 필수 조건은 아닙니다.  
> **실용적 구현**을 원하면 [6.5 간단한 대안](#65-간단한-대안-권장)을 참고하세요.

### 6.1 Flux 아키텍처 (선택사항 - 가산점)

Flux는 **Action → Dispatcher → Store → View** 단방향 흐름을 통해  
상태 변화의 예측 가능성과 디버깅 용이성을 확보합니다.

**적용 권장 시기:**
- 향후 확장 가능성이 높은 경우
- 복잡한 상태 동기화가 예상되는 경우
- 평가에서 가산점을 받고 싶은 경우

**대안:**
- 간단한 Context API (구독 정보만 관리)
- Clerk SDK 내장 훅 (인증)
- Next.js Server Components (데이터 조회)

```
User Interaction (View)
       ↓
Action Creator (예: AuthAction.login())
       ↓
Dispatcher (중앙 이벤트 허브)
       ↓
Store (상태 저장소 - AuthStore, SubscriptionStore 등)
       ↓
View Update (React Component Re-render)
       ↓
(순환) User Interaction...
```

### 6.2 주요 Store 구성 (선택사항)

> 💡 **구현 팁**: 아래 Store 중 대부분은 SDK 내장 기능이나 Server Components로 대체 가능합니다.

| Store명 | 필요성 | 관리 대상 | 주요 상태 키 | 연동 서비스 | 간단한 대안 |
|---------|--------|-----------|-------------|------------|------------|
| **AuthStore** | ⚠️ 선택 | 로그인/세션 관리 | `user`, `isAuthenticated`, `clerkUserId` | Clerk SDK | ✅ `useUser()`, `useAuth()` 훅 사용 |
| **SubscriptionStore** | ✅ 권장 | 구독 정보 관리 | `quota`, `planType` | Supabase + Toss | ✅ React Context API |
| **PaymentStore** | ⚠️ 선택 | 결제 상태 관리 | `lastPayment`, `paymentError` | TossPayments API | ✅ 로컬 useState |
| **AnalysisStore** | ⚠️ 선택 | 분석 데이터 관리 | `recentAnalyses`, `analysisCount` | Gemini API | ✅ Server Components |
| **SystemStore** | ⚠️ 선택 | 전역 UI 상태 | `isLoading`, `toast`, `error` | - | ✅ sonner 라이브러리 |

**범례:**
- ✅ **권장**: 전역 상태 관리가 실제로 필요함
- ⚠️ **선택**: SDK나 간단한 방법으로 대체 가능

### 6.3 Flux 흐름 예시: 로그인

```mermaid
sequenceDiagram
    participant U as User
    participant V as View(Component)
    participant A as AuthAction
    participant D as Dispatcher
    participant S as AuthStore
    participant API as Clerk SDK

    U->>V: Google 로그인 버튼 클릭
    V->>A: AuthAction.login()
    A->>D: dispatch("AUTH_LOGIN_REQUEST")
    D->>S: AuthStore 상태 업데이트 (loading: true)
    S->>API: Clerk.signIn()
    API-->>S: 로그인 성공 + User 정보
    S->>D: dispatch("AUTH_LOGIN_SUCCESS", payload)
    D->>V: AuthStore 변경 → View Re-render
    V->>U: Dashboard로 리다이렉트
```

### 6.4 Flux Store 구현 예시 (선택사항)

> ⚠️ **주의**: 이 코드는 가산점을 위한 참고용입니다. 실제로는 [6.5 간단한 대안](#65-간단한-대안-권장)이 더 실용적입니다.

```typescript
// stores/SubscriptionStore.ts (Flux 패턴)
import { Dispatcher } from '@/lib/dispatcher';
import { supabase } from '@/lib/supabase';

interface SubscriptionState {
  planType: 'free' | 'pro';
  quota: number;
  isLoading: boolean;
}

export class SubscriptionStore {
  private state: SubscriptionState = {
    planType: 'free',
    quota: 0,
    isLoading: false,
  };

  private listeners: Array<(state: SubscriptionState) => void> = [];

  getState() {
    return { ...this.state };
  }

  async fetchSubscription(userId: string) {
    this.state.isLoading = true;
    this.notify();

    const { data } = await supabase
      .from('subscriptions')
      .select('quota, plan_type')
      .eq('user_id', userId)
      .single();

    if (data) {
      this.state = {
        planType: data.plan_type,
        quota: data.quota,
        isLoading: false,
      };
    }

    this.notify();
  }

  subscribe(listener: (state: SubscriptionState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}
```

### 6.5 간단한 대안 (권장)

> ✅ **실용적 구현**: 대부분의 경우 이 방법으로 충분합니다.

#### 인증 상태 (Clerk 내장 훅)

```typescript
'use client';
import { useUser, useAuth } from '@clerk/nextjs';

export default function MyComponent() {
  // AuthStore 없이 바로 사용!
  const { user, isSignedIn } = useUser();
  const { userId } = useAuth();
  
  if (!isSignedIn) return <div>Please sign in</div>;
  return <div>Welcome, {user.firstName}!</div>;
}
```

#### 구독 정보 (Context API)

```typescript
// app/providers/subscription-provider.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface SubscriptionContextType {
  quota: number;
  planType: 'free' | 'pro';
  decrementQuota: () => void;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ 
  children,
  initialData 
}: { 
  children: React.ReactNode;
  initialData: { quota: number; planType: 'free' | 'pro' };
}) {
  const [quota, setQuota] = useState(initialData.quota);
  const [planType] = useState(initialData.planType);

  const decrementQuota = () => setQuota(q => Math.max(0, q - 1));
  
  const refreshSubscription = async () => {
    const res = await fetch('/api/subscription/status');
    const data = await res.json();
    setQuota(data.quota);
  };

  return (
    <SubscriptionContext.Provider value={{ quota, planType, decrementQuota, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be within SubscriptionProvider');
  return context;
};
```

#### 사용 예시

```typescript
// app/analysis/new/page.tsx
'use client';

import { useSubscription } from '@/app/providers/subscription-provider';
import { toast } from 'sonner';

export default function NewAnalysisPage() {
  const { quota, planType, decrementQuota } = useSubscription();
  
  const handleSubmit = async (data: FormData) => {
    if (quota <= 0) {
      toast.error('사용 가능한 횟수가 없습니다');
      return;
    }

    const result = await fetch('/api/analysis', { method: 'POST', body: data });
    
    if (result.ok) {
      decrementQuota();
      toast.success('분석 완료!');
    }
  };
  
  return (
    <div>
      <p>남은 횟수: {quota}회 | 플랜: {planType}</p>
      {/* 폼... */}
    </div>
  );
}
```

### 6.6 구현 방식 비교

| 항목 | Flux 아키텍처 | 간단한 대안 |
|------|-------------|-----------|
| **복잡도** | 높음 | 낮음 ✅ |
| **파일 수** | 15개+ | 3-5개 ✅ |
| **코드 라인** | 1000+ | 200-300 ✅ |
| **학습 곡선** | 가파름 | 완만함 ✅ |
| **유지보수** | 어려움 | 쉬움 ✅ |
| **확장성** | 높음 ✅ | 중간 |
| **평가 가산점** | 가능 ✅ | - |

**권장**: 평가 가산점이 필요 없다면 **간단한 대안 (6.5)** 사용을 강력히 권장합니다.

---

## 7. Clerk Webhook 통합 (필수)

> ⚠️ **중요**: Clerk Webhook은 **서비스가 배포된 상태**에서만 작동합니다!  
> 로컬 개발 시 `ngrok` 또는 Vercel Preview 배포를 통해 테스트하세요.

### 7.1 Webhook 이벤트 처리

| Webhook Event | 처리 로직 | Supabase 동기화 | 비고 |
|---------------|-----------|----------------|------|
| `user.created` | 1. Supabase `users` 테이블에 INSERT<br>2. 무료 쿼터 3회 초기화<br>3. `planType: 'free'` 설정 | `users`, `subscriptions` | 신규 가입 시 자동 실행 |
| `user.updated` | Clerk 사용자 정보 변경 시 Supabase 동기화 | `users` | 프로필 수정 반영 |
| `user.deleted` | 1. `subscriptions` 테이블 CASCADE DELETE<br>2. `analyses` 테이블 CASCADE DELETE<br>3. `users` 테이블 DELETE | `users`, `subscriptions`, `analyses` | 회원 탈퇴 처리 |

### 7.2 Webhook 엔드포인트

**경로**: `/app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const wh = new Webhook(WEBHOOK_SECRET);
  const payload = await req.json();
  
  try {
    const evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Supabase에 사용자 생성 + 무료 쿼터 초기화
      await supabase.from('users').insert({
        clerk_user_id: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
      });

      await supabase.from('subscriptions').insert({
        user_id: id,
        plan_type: 'free',
        quota: 3,
        status: 'active',
      });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      // CASCADE DELETE로 관련 데이터 모두 삭제
      await supabase.from('users').delete().eq('clerk_user_id', id);
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (err) {
    return new Response('Webhook verification failed', { status: 400 });
  }
}
```

### 7.3 Webhook 설정 방법

1. Clerk Dashboard → Webhooks 메뉴 진입
2. Endpoint URL 등록: `https://yourdomain.com/api/webhooks/clerk`
3. 구독 이벤트 선택: `user.created`, `user.updated`, `user.deleted`
4. Webhook Secret 복사 후 `.env.local`에 저장

```bash
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 8. 토스페이먼츠 구독 결제 플로우

### 8.1 BillingKey 발급 및 정기결제

```mermaid
flowchart TD
    A[사용자: Pro 구독 선택] --> B[토스 결제 위젯 호출]
    B --> C[카드 정보 입력 + 약관 동의]
    C --> D[토스 서버: BillingKey 발급]
    D --> E[Next.js API: /api/payments/subscribe]
    E --> F{첫 결제 성공?}
    F -->|성공| G[Supabase: BillingKey 저장<br>status='active'<br>quota=10]
    F -->|실패| H[결제 실패 처리<br>BillingKey 삭제]
    G --> I[SubscriptionStore 업데이트]
    I --> J[사용자: 구독 활성화 완료]
```

### 8.2 구독 취소 및 재활성화

| 동작 | API 엔드포인트 | 처리 로직 | Supabase 업데이트 |
|------|---------------|-----------|------------------|
| **구독 취소** | `POST /api/subscription/cancel` | 1. `status = 'cancelled'`로 변경<br>2. BillingKey 유지<br>3. `cancelled_at` 기록 | `subscriptions` 테이블 |
| **취소 재활성화** | `POST /api/subscription/reactivate` | 1. `status = 'active'`로 복원<br>2. `cancelled_at = null`<br>3. BillingKey 그대로 사용 | `subscriptions` 테이블 |
| **구독 해지** | `POST /api/subscription/terminate` | 1. 토스 API로 BillingKey 삭제<br>2. `status = 'terminated'`<br>3. `quota = 0` | `subscriptions` 테이블 |

### 8.3 정기 결제 자동화 (Supabase Cron)

#### 📅 Cron 작동 플로우

```mermaid
flowchart TD
    A[Supabase Cron: 매일 02:00 KST] --> B[Next.js API 호출<br>/api/cron/process-billing]
    B --> C{인증 토큰 검증}
    C -->|실패| D[401 Unauthorized 반환]
    C -->|성공| E[오늘이 결제일인<br>구독 조회]
    E --> F{구독 건 존재?}
    F -->|없음| G[200 OK 반환]
    F -->|있음| H[각 구독별 처리 Loop]
    H --> I[토스 API: BillingKey로 결제 요청]
    I --> J{결제 성공?}
    J -->|성공| K[1. 구독 기간 +1개월 연장<br>2. quota = 10 리셋<br>3. last_payment_date 업데이트]
    J -->|실패| L[1. status = 'terminated'<br>2. BillingKey 삭제<br>3. quota = 0]
    K --> M[SubscriptionStore 업데이트]
    L --> M
    M --> N[다음 구독 처리]
    N --> H
```

#### 🛠️ Cron 설정 (Supabase)

Supabase Dashboard → Database → Cron Jobs에서 설정:

```sql
-- 매일 새벽 2시(KST)에 정기결제 트리거
SELECT cron.schedule(
  'process-daily-billing',
  '0 17 * * *',  -- UTC 17:00 = KST 02:00 (다음날)
  $$
  SELECT net.http_post(
    url := 'https://yourdomain.vercel.app/api/cron/process-billing',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_CRON_SECRET_TOKEN'
    ),
    body := jsonb_build_object('trigger', 'cron')
  );
  $$
);
```

#### 🔒 Cron API 인증

`/app/api/cron/process-billing/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TossPayments } from '@/lib/toss';

export async function POST(req: NextRequest) {
  // 1. Cron 요청 검증
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. 오늘이 결제일인 구독 조회
  const today = new Date().toISOString().split('T')[0];
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('next_payment_date', today);

  // 3. 각 구독별 결제 처리
  for (const sub of subscriptions || []) {
    try {
      const payment = await TossPayments.charge({
        billingKey: sub.billing_key,
        amount: 9900, // Pro 요금제 가격
        orderName: '사주분석 Pro 구독',
      });

      if (payment.status === 'DONE') {
        // 결제 성공: 구독 연장
        await supabase
          .from('subscriptions')
          .update({
            quota: 10,
            next_payment_date: addMonths(today, 1),
            last_payment_date: today,
          })
          .eq('id', sub.id);
      }
    } catch (error) {
      // 결제 실패: 즉시 해지
      await supabase
        .from('subscriptions')
        .update({
          status: 'terminated',
          quota: 0,
          billing_key: null,
        })
        .eq('id', sub.id);

      // BillingKey 삭제
      await TossPayments.deleteBillingKey(sub.billing_key);
    }
  }

  return NextResponse.json({ message: 'Billing processed' });
}
```

---

## 9. Gemini API 사주분석

### 9.1 프롬프트 함수

`/lib/prompts/saju.ts`:

```typescript
import type { TestInput } from '@/types/test';

export const generateSajuPrompt = (input: TestInput): string => {
  return `당신은 20년 경력의 전문 사주팔자 상담사입니다.

**입력 정보**:
- 성함: ${input.name}
- 생년월일: ${input.birthDate}
- 출생시간: ${input.birthTime || '미상'}
- 성별: ${input.gender === 'male' ? '남성' : '여성'}

**분석 요구사항**:
1️⃣ 천간(天干)과 지지(地支) 계산  
2️⃣ 오행(五行) 분석 (목, 화, 토, 금, 수)  
3️⃣ 대운(大運)과 세운(歲運) 해석  
4️⃣ 전반적인 성격, 재운, 건강운, 연애운 분석  

**출력 형식**: 마크다운  

**금지 사항**:
- 의료·법률 조언 금지
- 확정적 미래 예측 금지
- 부정적·공격적 표현 금지`;
};
```

### 9.2 Free vs Pro 모델 구분

```typescript
// /lib/gemini/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async analyze(prompt: string, isPro: boolean) {
    const modelName = isPro ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
```

### 9.3 분석 요청 플로우 (Flux 통합)

```mermaid
sequenceDiagram
    participant U as User
    participant V as AnalysisForm
    participant A as AnalysisAction
    participant D as Dispatcher
    participant AS as AnalysisStore
    participant SS as SubscriptionStore
    participant API as Gemini API

    U->>V: 사주 정보 입력 + 제출
    V->>A: AnalysisAction.create(input)
    A->>D: dispatch("ANALYSIS_CREATE_REQUEST")
    D->>SS: 쿼터 확인
    SS-->>D: quota > 0 확인
    D->>AS: 분석 시작 (loading: true)
    AS->>API: Gemini.analyze(prompt, isPro)
    API-->>AS: 분석 결과 반환
    AS->>D: dispatch("ANALYSIS_CREATE_SUCCESS", result)
    D->>SS: quota - 1 차감
    D->>V: 결과 페이지로 이동
```

---

## 10. 데이터베이스 스키마 (Supabase)

> 📌 **아키텍처 노트**:  
> - **인증**: Clerk SDK가 담당 (Google OAuth, 세션 관리)
> - **데이터 저장**: Supabase PostgreSQL이 담당
> - **연동 방식**: Clerk Webhook → Supabase 동기화 (users 테이블의 `clerk_user_id` 외래키)
> - **RLS 정책**: Clerk의 JWT를 Supabase RLS에서 검증하여 접근 제어

### 10.1 `users` 테이블

```sql
-- Clerk 사용자 정보를 Supabase에 동기화하는 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL, -- Clerk User ID (외래키 역할)
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스: Clerk User ID로 빠른 조회
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
```

### 10.2 `subscriptions` 테이블

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'cancelled' | 'terminated'
  billing_key VARCHAR(255), -- 토스페이먼츠 BillingKey
  quota INT NOT NULL DEFAULT 3, -- 무료: 3, Pro: 10
  next_payment_date DATE, -- 다음 결제일
  last_payment_date DATE, -- 마지막 결제일
  cancelled_at TIMESTAMP, -- 취소 요청 시간
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 10.3 `analyses` 테이블

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time VARCHAR(10),
  gender VARCHAR(10) NOT NULL,
  result_markdown TEXT NOT NULL, -- Gemini 분석 결과
  model_used VARCHAR(50) NOT NULL, -- 'gemini-2.5-flash' | 'gemini-2.5-pro'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
```

---

## 11. 환경 변수 설정

`.env.local`:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Toss Payments
TOSS_SECRET_KEY=test_sk_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxxxxxxxxxxx

# Gemini
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx

# Cron Secret
CRON_SECRET_TOKEN=your-random-secure-token-here
```

---

## 12. VibeCoding 평가 기준 체크리스트

### ✅ 필수 통과 조건

- [ ] **Clerk 인증 연동**: Google 로그인 정상 작동
- [ ] **Clerk Webhook 연동**: `user.created`, `user.deleted` 이벤트 처리
- [ ] **토스페이먼츠 구독결제**: BillingKey 발급 및 정기결제 정상 작동
- [ ] **Gemini API 분석**: Free(Flash) / Pro(Pro) 모델 구분 정상 작동
- [ ] **5개 페이지 구현**: 홈, 대시보드, 새 분석, 상세보기, 구독 관리
- [ ] **구독 정책 준수**:
  - [ ] 무료 유저 3회 제한
  - [ ] Pro 유저 월 10회 제한
  - [ ] Pro 취소 후 결제일까지 유지
  - [ ] 취소 재활성화 기능
  - [ ] 해지 시 BillingKey 삭제
- [ ] **Supabase Cron**: 매일 02:00 정기결제 자동 실행

> ⚠️ **중요**: 위 항목들만 통과하면 평가에 합격할 수 있습니다!

### 🎁 가산점 요소 (선택사항)

> 💡 **Flux는 필수가 아닙니다**: 간단한 Context API 구현만으로도 평가를 통과할 수 있습니다.  
> Flux 아키텍처는 가산점을 받고 싶을 때만 구현하세요.

- [ ] **Flux 아키텍처 구현**: Action/Dispatcher/Store 명확한 분리 (⚠️ **선택사항**)
- [ ] **단방향 데이터 흐름 다이어그램**: Mermaid 등으로 시각화
- [ ] **Webhook 배포 검증**: Vercel 배포 후 Clerk Webhook 정상 작동 확인
- [ ] **프롬프트 고도화**: Gemini 시스템 프롬프트 버전 관리
- [ ] **에러 핸들링**: 결제 실패, API 오류 등 예외 상황 처리

**권장 구현 방식:**
- ✅ **필수만 구현 + 간단한 Context API** (섹션 6.5 참고) → 평가 통과
- ✅ **필수 + Flux 구현** (섹션 6.4 참고) → 평가 통과 + 가산점

---

## 13. 마무리

본 문서는 **VibeCoding 평가 기준을 100% 충족**하는 것을 목표로 작성되었습니다.

### 🎯 핵심 포인트

1. **EasyNext 템플릿 기반**: 업그레이드된 EasyNext 템플릿을 기반으로 개발
2. **Clerk 인증 우선**: EasyNext의 Supabase Auth 대신 Clerk SDK + Webhook 사용 (평가 조건 강제)
3. **상태 관리 선택**: Flux는 가산점 요소, 간단한 Context API로도 충분
4. **Clerk Webhook**: 배포 환경에서 필수 테스트
5. **구독 정책**: 취소/재활성화/해지 시나리오 완벽 구현
6. **정기 결제 자동화**: Supabase Cron + Next.js API 완벽 연동

> 💡 **템플릿 아키텍처 충돌 해결**:  
> EasyNext 템플릿은 Supabase Auth를 포함하지만, 평가 조건에서 Clerk 사용이 강제되므로  
> 인증 레이어만 Clerk로 교체하고, Supabase는 DB/Cron 용도로만 활용합니다.

> 💡 **상태 관리 권장사항**:  
> - **간단한 구현 (권장)**: Context API 1개 (섹션 6.5)
> - **고급 구현 (가산점)**: Flux 아키텍처 (섹션 6.1-6.4)
> - 평가 통과에는 간단한 Context API만으로도 충분합니다!

### 📁 권장 프로젝트 구조

#### Option A: 간단한 구조 (권장)

```
/
├── app/
│   ├── providers/
│   │   └── subscription-provider.tsx  ← Context API (구독 정보만)
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── clerk/route.ts  ← Clerk Webhook
│   │   ├── cron/
│   │   │   └── process-billing/route.ts  ← 정기결제
│   │   ├── subscription/
│   │   │   ├── status/route.ts
│   │   │   ├── cancel/route.ts
│   │   │   ├── reactivate/route.ts
│   │   │   └── terminate/route.ts
│   │   └── analysis/
│   │       └── create/route.ts
│   ├── dashboard/
│   ├── analysis/
│   │   ├── new/
│   │   └── [id]/
│   └── subscription/
├── lib/
│   ├── supabase.ts
│   ├── toss.ts
│   ├── gemini/
│   │   └── client.ts
│   └── prompts/
│       └── saju.ts
└── types/
    └── test.ts
```

**파일 수**: ~15개  
**상태 관리**: Context API 1개 (SubscriptionProvider)  
**학습 곡선**: 낮음

---

#### Option B: Flux 구조 (가산점용)

```
/
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── clerk/route.ts
│   │   ├── cron/
│   │   │   └── process-billing/route.ts
│   │   ├── subscription/
│   │   │   ├── cancel/route.ts
│   │   │   ├── reactivate/route.ts
│   │   │   └── terminate/route.ts
│   │   └── analysis/
│   │       └── create/route.ts
│   ├── dashboard/
│   ├── analysis/
│   │   ├── new/
│   │   └── [id]/
│   └── subscription/
├── stores/  ← Flux Store (선택사항)
│   ├── AuthStore.ts
│   ├── SubscriptionStore.ts
│   ├── PaymentStore.ts
│   └── AnalysisStore.ts
├── actions/  ← Flux Action (선택사항)
│   ├── AuthAction.ts
│   ├── SubscriptionAction.ts
│   └── AnalysisAction.ts
├── lib/
│   ├── dispatcher.ts  ← Flux Dispatcher (선택사항)
│   ├── supabase.ts
│   ├── toss.ts
│   ├── gemini/
│   │   └── client.ts
│   └── prompts/
│       └── saju.ts
└── types/
    └── test.ts
```

**파일 수**: ~25개  
**상태 관리**: Flux 아키텍처 (Action/Dispatcher/Store)  
**학습 곡선**: 높음  
**평가 가산점**: ✅

---

**문서 버전**: 2.0 (B안 적용)  
**작성일**: 2025-10-25  
**평가 대상**: VibeCoding 구독제 사주분석 서비스

> 📌 **최종 권장**: 평가 통과만 목표라면 **Option A**를, 가산점을 원한다면 **Option B**를 선택하세요.