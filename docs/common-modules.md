# 공통 모듈 작업 계획 (Common Modules Implementation Plan)

**문서 버전**: 1.0
**작성일**: 2025-10-25
**목적**: 페이지 단위 개발 전 공통 인프라 구축

---

## 목차
1. [개요](#1-개요)
2. [우선순위 및 일정](#2-우선순위-및-일정)
3. [모듈 상세 설계](#3-모듈-상세-설계)
4. [검증 체크리스트](#4-검증-체크리스트)

---

## 1. 개요

### 1.1 설계 원칙
- **간결성 우선**: 문서에 명시된 요구사항만 구현 (오버엔지니어링 금지)
- **병렬 개발 대비**: 페이지 간 코드 충돌 방지를 위한 공통 모듈 선행 작업
- **테스트 가능성**: 각 모듈은 독립적으로 테스트 가능해야 함
- **타입 안전성**: 모든 모듈은 TypeScript strict mode 준수

### 1.2 코드베이스 현황 분석

**기존 구조**:
```
src/
├── app/                      # Next.js App Router
│   ├── api/[[...hono]]/      # Hono 위임 엔드포인트
│   ├── (protected)/          # 인증 필요 페이지
│   ├── login/, signup/       # 인증 페이지
├── backend/
│   ├── hono/                 # Hono 앱 (app.ts, context.ts)
│   ├── middleware/           # 에러, 컨텍스트, Supabase 미들웨어
│   ├── http/                 # 응답 포맷 (response.ts)
│   ├── supabase/             # Supabase 서버 클라이언트
│   ├── config/               # 환경 변수 파싱
├── features/
│   ├── auth/                 # 인증 (타입, 훅, Context)
│   ├── example/              # 예시 기능
├── lib/
│   ├── supabase/             # Supabase 클라이언트 (server, browser)
│   ├── remote/               # API 클라이언트 (axios)
│   ├── utils.ts              # 유틸리티 (cn)
├── components/ui/            # Shadcn UI 컴포넌트
├── constants/                # 환경 변수, 상수
```

**기존 구현 상태**:
- ✅ Supabase 클라이언트 (서버/브라우저)
- ✅ Hono 앱 기본 구조 (app.ts, context.ts)
- ✅ 공통 미들웨어 (에러, Supabase)
- ✅ 인증 Context (useCurrentUser 훅)
- ✅ API 클라이언트 (axios 기반)
- ✅ Shadcn UI 기본 컴포넌트

**추가 필요 사항**:
- ❌ Clerk 연동 (클라이언트/서버/Webhook)
- ❌ Gemini API 클라이언트
- ❌ 토스페이먼츠 연동
- ❌ 마크다운 파서
- ❌ 공통 레이아웃 컴포넌트
- ❌ 정기 결제 Cron API
- ❌ 에러 페이지 (404, 403, 500)

---

## 2. 우선순위 및 일정

### Phase 1: 핵심 인프라 (1-2일)
**목적**: 모든 페이지에서 필수적으로 사용하는 기반 시스템
**의존성**: 없음 (독립적으로 구현 가능)

| 모듈 | 우선순위 | 예상 시간 | 담당 파일 |
|------|---------|---------|-----------|
| 1.1 Clerk 클라이언트 연동 | P0 | 3h | `src/lib/clerk/` |
| 1.2 Clerk 서버 미들웨어 | P0 | 2h | `src/backend/middleware/clerk.ts` |
| 1.3 Clerk Webhook 핸들러 | P0 | 4h | `src/features/auth/backend/webhook.ts` |
| 1.4 Gemini API 클라이언트 | P1 | 3h | `src/lib/gemini/` |
| 1.5 환경 변수 검증 강화 | P0 | 1h | `src/backend/config/index.ts` |

### Phase 2: 비즈니스 로직 (2-3일)
**목적**: 사주 분석 및 구독 관리 핵심 기능
**의존성**: Phase 1 완료 필요

| 모듈 | 우선순위 | 예상 시간 | 담당 파일 |
|------|---------|---------|-----------|
| 2.1 토스페이먼츠 클라이언트 | P1 | 4h | `src/lib/toss-payments/` |
| 2.2 BillingKey 관리 유틸 | P1 | 2h | `src/features/subscription/lib/billing.ts` |
| 2.3 정기 결제 Cron API | P1 | 3h | `src/app/api/cron/process-billing/route.ts` |
| 2.4 마크다운 파서 | P2 | 2h | `src/lib/markdown/` |
| 2.5 사주 프롬프트 생성기 | P1 | 2h | `src/lib/gemini/prompts.ts` |

### Phase 3: UI/UX 공통 컴포넌트 (1-2일)
**목적**: 일관된 사용자 경험 제공
**의존성**: Phase 1 완료 필요

| 모듈 | 우선순위 | 예상 시간 | 담당 파일 |
|------|---------|---------|-----------|
| 3.1 공통 레이아웃 (Header/Footer) | P1 | 3h | `src/components/layout/` |
| 3.2 로딩 컴포넌트 | P2 | 1h | `src/components/ui/loading.tsx` |
| 3.3 에러 페이지 (404/403/500) | P2 | 2h | `src/app/` |
| 3.4 모달/다이얼로그 래퍼 | P2 | 2h | `src/components/ui/dialog.tsx` |

### Phase 4: 유틸리티 (병렬 작업 가능)
**목적**: 편의 함수 및 헬퍼
**의존성**: 없음

| 모듈 | 우선순위 | 예상 시간 | 담당 파일 |
|------|---------|---------|-----------|
| 4.1 날짜/시간 포맷 유틸 | P2 | 1h | `src/lib/utils/date.ts` |
| 4.2 Zod 공통 스키마 | P1 | 2h | `src/lib/validation/` |
| 4.3 에러 메시지 관리 | P2 | 1h | `src/constants/messages.ts` |

**총 예상 시간**: 33시간 (약 4-5일)

---

## 3. 모듈 상세 설계

### 3.1 Clerk 인증 시스템

#### 3.1.1 클라이언트 연동
**경로**: `src/lib/clerk/client.ts`
**목적**: Clerk SDK 클라이언트 사이드 연동
**의존성**: `@clerk/nextjs`

**구현 내용**:
```typescript
// src/lib/clerk/client.ts
import { ClerkProvider, useAuth, useUser } from '@clerk/nextjs';

export { ClerkProvider, useAuth, useUser };

// 재사용 가능한 훅
export const useClerkUser = () => {
  const { user, isLoaded } = useUser();
  return {
    user,
    isLoaded,
    userId: user?.id || null,
    email: user?.emailAddresses?.[0]?.emailAddress || null,
    name: user?.fullName || null,
  };
};
```

**필요 파일**:
- `src/lib/clerk/client.ts` - 클라이언트 훅
- `src/lib/clerk/provider.tsx` - ClerkProvider 래퍼

**환경 변수**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

#### 3.1.2 서버 미들웨어
**경로**: `src/backend/middleware/clerk.ts`
**목적**: Hono API에서 Clerk JWT 검증
**의존성**: `@clerk/backend`, Hono Context

**구현 내용**:
```typescript
// src/backend/middleware/clerk.ts
import { clerkClient } from '@clerk/backend';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../hono/context';

export const withClerkAuth = (): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const session = await clerkClient.sessions.verifySession(token);
      c.set('clerkUserId', session.userId);
      await next();
    } catch (error) {
      return c.json({ error: 'Invalid token' }, 401);
    }
  };
};
```

**필요 파일**:
- `src/backend/middleware/clerk.ts` - JWT 검증 미들웨어
- `src/backend/hono/context.ts` - AppEnv 타입 확장 (`clerkUserId` 추가)

---

#### 3.1.3 Clerk Webhook 핸들러
**경로**: `src/features/auth/backend/webhook.ts`
**목적**: user.created, user.updated, user.deleted 이벤트 처리
**의존성**: `svix`, Supabase

**구현 내용**:
```typescript
// src/features/auth/backend/webhook.ts
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';

export async function handleClerkWebhook(
  payload: string,
  headers: Record<string, string>
) {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const evt = wh.verify(payload, headers) as WebhookEvent;

    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

async function handleUserCreated(user: any) {
  const supabase = createSupabaseClient();

  // subscriptions 테이블에 INSERT (users 테이블 제거됨)
  await supabase.from('subscriptions').insert({
    clerk_user_id: user.id,
    plan_type: 'free',
    quota: 3,
    status: 'active',
  });
}

// 유사하게 updated, deleted 핸들러 구현...
```

**필요 파일**:
- `src/features/auth/backend/webhook.ts` - Webhook 핸들러
- `src/app/api/webhooks/clerk/route.ts` - Next.js API Route

**환경 변수**:
```env
CLERK_WEBHOOK_SECRET=
```

---

### 3.2 Gemini API 연동

#### 3.2.1 Gemini 클라이언트
**경로**: `src/lib/gemini/client.ts`
**목적**: Gemini API 호출 래퍼
**의존성**: `@google/generative-ai`

**구현 내용**:
```typescript
// src/lib/gemini/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeWithGemini(
  prompt: string,
  isPro: boolean
): Promise<string> {
  const model = isPro ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const geminiModel = genAI.getGenerativeModel({ model });

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
```

**필요 파일**:
- `src/lib/gemini/client.ts` - API 클라이언트
- `src/lib/gemini/prompts.ts` - 사주 프롬프트 생성기

**환경 변수**:
```env
GEMINI_API_KEY=
```

---

#### 3.2.2 사주 프롬프트 생성기
**경로**: `src/lib/gemini/prompts.ts`
**목적**: 사용자 입력 기반 프롬프트 생성
**의존성**: 없음

**구현 내용**:
```typescript
// src/lib/gemini/prompts.ts
export interface SajuInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  gender: 'male' | 'female';
}

export function generateSajuPrompt(input: SajuInput): string {
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

**출력 형식**: 마크다운 (제목, 소제목, 리스트 활용)

**금지 사항**:
- 의료·법률 조언 금지
- 확정적 미래 예측 금지 (가능성으로 표현)
- 부정적·공격적 표현 금지

이제 분석을 시작해주세요.`;
}
```

**필요 파일**:
- `src/lib/gemini/prompts.ts`
- `src/lib/gemini/types.ts` - 타입 정의

---

### 3.3 토스페이먼츠 연동

#### 3.3.1 토스페이먼츠 클라이언트
**경로**: `src/lib/toss-payments/client.ts`
**목적**: BillingKey 발급, 결제, 삭제
**의존성**: 없음 (REST API 직접 호출)

**구현 내용**:
```typescript
// src/lib/toss-payments/client.ts
import axios from 'axios';

const TOSS_BASE_URL = 'https://api.tosspayments.com/v1';

export class TossPaymentsClient {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private getAuthHeader() {
    return {
      Authorization: `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
    };
  }

  async issueBillingKey(authKey: string, customerKey: string): Promise<string> {
    const response = await axios.post(
      `${TOSS_BASE_URL}/billing/authorizations/issue`,
      { authKey, customerKey },
      { headers: this.getAuthHeader() }
    );
    return response.data.billingKey;
  }

  async chargeBilling(params: {
    billingKey: string;
    amount: number;
    orderName: string;
    customerEmail: string;
    customerName: string;
  }) {
    const response = await axios.post(
      `${TOSS_BASE_URL}/billing/${params.billingKey}`,
      {
        amount: params.amount,
        orderName: params.orderName,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
      },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteBillingKey(billingKey: string) {
    await axios.delete(
      `${TOSS_BASE_URL}/billing/authorizations/${billingKey}`,
      { headers: this.getAuthHeader() }
    );
  }
}

export const tossPayments = new TossPaymentsClient(
  process.env.TOSS_SECRET_KEY!
);
```

**필요 파일**:
- `src/lib/toss-payments/client.ts`
- `src/lib/toss-payments/types.ts`

**환경 변수**:
```env
TOSS_SECRET_KEY=
NEXT_PUBLIC_TOSS_CLIENT_KEY=
```

---

#### 3.3.2 정기 결제 Cron API
**경로**: `src/app/api/cron/process-billing/route.ts`
**목적**: 매일 02:00 KST 정기 결제 처리
**의존성**: Supabase, TossPaymentsClient

**구현 내용**:
```typescript
// src/app/api/cron/process-billing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { tossPayments } from '@/lib/toss-payments/client';

export async function POST(req: NextRequest) {
  // 1. Cron 인증 검증
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  // 2. 오늘이 결제일인 구독 조회
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .eq('next_payment_date', new Date().toISOString().split('T')[0]);

  if (error || !subscriptions) {
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  const results = { success: 0, failed: 0 };

  // 3. 각 구독 결제 처리
  for (const sub of subscriptions) {
    try {
      await tossPayments.chargeBilling({
        billingKey: sub.billing_key,
        amount: 9900,
        orderName: '사주분석 Pro 구독',
        customerEmail: sub.user_email,
        customerName: sub.user_name,
      });

      // 결제 성공: 쿼터 리셋
      await supabase
        .from('subscriptions')
        .update({
          quota: 10,
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          last_payment_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', sub.id);

      results.success++;
    } catch (error) {
      // 결제 실패: 해지 처리
      await supabase
        .from('subscriptions')
        .update({
          status: 'terminated',
          billing_key: null,
          quota: 0,
          next_payment_date: null,
        })
        .eq('id', sub.id);

      await tossPayments.deleteBillingKey(sub.billing_key);
      results.failed++;
    }
  }

  return NextResponse.json({ message: 'Billing processed', results });
}
```

**필요 파일**:
- `src/app/api/cron/process-billing/route.ts`

**환경 변수**:
```env
CRON_SECRET_TOKEN=
```

---

### 3.4 마크다운 파서

**경로**: `src/lib/markdown/parser.tsx`
**목적**: Gemini 응답 마크다운 → React 컴포넌트 변환
**의존성**: `react-markdown`, `rehype-sanitize`

**구현 내용**:
```typescript
// src/lib/markdown/parser.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeSanitize]}
      className="prose prose-purple max-w-none"
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mb-2 text-gray-700">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

**필요 파일**:
- `src/lib/markdown/parser.tsx`

**패키지 설치**:
```bash
npm install react-markdown rehype-sanitize
```

---

### 3.5 공통 레이아웃 컴포넌트

#### 3.5.1 Header 컴포넌트
**경로**: `src/components/layout/header.tsx`
**목적**: 전역 네비게이션 바
**의존성**: Clerk useUser, shadcn/ui

**구현 내용**:
```typescript
// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          사주풀이
        </Link>

        <nav className="flex items-center gap-6">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">내 분석</Button>
              </Link>
              <Link href="/analysis/new">
                <Button variant="default">새 분석</Button>
              </Link>
              <Link href="/subscription">
                <Button variant="ghost">구독 관리</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button variant="default">시작하기</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

**필요 파일**:
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/main-layout.tsx`

---

### 3.6 에러 페이지

**경로**: `src/app/` (Next.js 규칙)
**목적**: 404, 403, 500 에러 일관된 UI
**의존성**: Tailwind CSS

**구현 내용**:
```typescript
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">페이지를 찾을 수 없습니다</p>
        <Link href="/dashboard">
          <Button>대시보드로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
```

**필요 파일**:
- `src/app/not-found.tsx` - 404
- `src/app/forbidden.tsx` - 403 (재사용 컴포넌트)
- `src/app/error.tsx` - 500

---

### 3.7 유틸리티 함수

#### 3.7.1 날짜/시간 포맷
**경로**: `src/lib/utils/date.ts`
**목적**: 일관된 날짜 표시
**의존성**: `date-fns`

**구현 내용**:
```typescript
// src/lib/utils/date.ts
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko });
}

export function formatTime(time: string): string {
  const [hour, minute] = time.split(':');
  const ampm = parseInt(hour) >= 12 ? '오후' : '오전';
  const hour12 = parseInt(hour) % 12 || 12;
  return `${ampm} ${hour12}시 ${minute}분`;
}
```

**필요 파일**:
- `src/lib/utils/date.ts`

---

#### 3.7.2 Zod 공통 스키마
**경로**: `src/lib/validation/schemas.ts`
**목적**: 재사용 가능한 검증 스키마
**의존성**: `zod`

**구현 내용**:
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요')
  .max(20, '이름은 20자 이내여야 합니다');

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

// 사주 분석 입력 스키마
export const sajuInputSchema = z.object({
  name: nameSchema,
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  gender: genderSchema,
});
```

**필요 파일**:
- `src/lib/validation/schemas.ts`
- `src/lib/validation/types.ts`

---

#### 3.7.3 에러 메시지 관리
**경로**: `src/constants/messages.ts`
**목적**: 에러 메시지 중앙 관리
**의존성**: 없음

**구현 내용**:
```typescript
// src/constants/messages.ts
export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: '로그인이 필요합니다',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
    FORBIDDEN: '접근 권한이 없습니다',
  },
  ANALYSIS: {
    QUOTA_EXCEEDED: '사용 가능한 횟수가 없습니다. Pro 구독이 필요합니다',
    API_ERROR: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
    NOT_FOUND: '존재하지 않는 분석입니다',
  },
  SUBSCRIPTION: {
    ALREADY_SUBSCRIBED: '이미 Pro 구독 중입니다',
    PAYMENT_FAILED: '결제 중 오류가 발생했습니다',
    CANCEL_FAILED: '구독 취소 중 오류가 발생했습니다',
  },
  NETWORK: {
    TIMEOUT: '네트워크 연결을 확인해주세요',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  },
} as const;

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: '로그인되었습니다',
    SIGNUP_SUCCESS: '회원가입이 완료되었습니다! 무료 분석 3회를 드립니다',
  },
  ANALYSIS: {
    COMPLETED: '분석이 완료되었습니다!',
    DELETED: '분석이 삭제되었습니다',
  },
  SUBSCRIPTION: {
    SUBSCRIBED: 'Pro 구독이 완료되었습니다!',
    CANCELLED: '구독이 취소되었습니다',
    REACTIVATED: '구독이 재활성화되었습니다',
    TERMINATED: '구독이 해지되었습니다',
  },
} as const;
```

**필요 파일**:
- `src/constants/messages.ts`

---

### 3.8 환경 변수 검증 강화

**경로**: `src/backend/config/index.ts` (기존 파일 확장)
**목적**: 런타임 환경 변수 검증
**의존성**: `zod`

**구현 내용**:
```typescript
// src/backend/config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),

  // Toss Payments
  TOSS_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().min(1),

  // Cron
  CRON_SECRET_TOKEN: z.string().min(1),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
```

**필요 파일**:
- `src/backend/config/index.ts` (수정)

---

## 4. 검증 체크리스트

### Phase 1 검증 (핵심 인프라)
- [ ] Clerk 클라이언트: `useClerkUser()` 훅 정상 작동
- [ ] Clerk 서버: Hono API에서 JWT 검증 성공
- [ ] Clerk Webhook: user.created 이벤트로 subscriptions INSERT 확인
- [ ] Gemini API: 테스트 프롬프트로 응답 정상 수신
- [ ] 환경 변수: `.env.local` 누락 시 앱 시작 실패 확인

### Phase 2 검증 (비즈니스 로직)
- [ ] 토스페이먼츠: 테스트 BillingKey 발급 성공
- [ ] 토스페이먼츠: 테스트 결제 9,900원 성공
- [ ] Cron API: 수동 호출 시 정기 결제 처리 확인
- [ ] 마크다운 파서: XSS 방지 (rehype-sanitize) 동작 확인
- [ ] 사주 프롬프트: 모든 입력 필드 포함 여부 확인

### Phase 3 검증 (UI/UX)
- [ ] Header: 로그인/비로그인 상태별 UI 정상 표시
- [ ] 404 페이지: 존재하지 않는 URL 접근 시 표시
- [ ] 403 페이지: 권한 없는 분석 접근 시 표시
- [ ] 500 페이지: 에러 throw 시 표시

### Phase 4 검증 (유틸리티)
- [ ] 날짜 포맷: 한글 형식 정상 출력
- [ ] Zod 스키마: 유효성 검증 에러 메시지 한글화
- [ ] 에러 메시지: 모든 에러 케이스 메시지 존재

### 최종 통합 검증
- [ ] 회원가입 → Webhook → Supabase 동기화 E2E 테스트
- [ ] Gemini API 호출 → 마크다운 파싱 → UI 렌더링 E2E 테스트
- [ ] Pro 구독 → 토스 결제 → Supabase 업데이트 E2E 테스트
- [ ] 정기 결제 Cron → 쿼터 리셋 → 이메일 알림 E2E 테스트 (선택)
- [ ] 타입스크립트: `npm run build` 에러 없이 성공
- [ ] ESLint: `npm run lint` 에러 없이 성공

---

## 5. 의존성 설치 명령어

### NPM 패키지
```bash
# Clerk
npm install @clerk/nextjs @clerk/backend

# Gemini
npm install @google/generative-ai

# Markdown
npm install react-markdown rehype-sanitize

# Webhook
npm install svix

# 이미 설치된 패키지 확인 (package.json 참고)
# - @supabase/supabase-js
# - @supabase/ssr
# - zod
# - axios
# - date-fns
# - hono
```

### Shadcn UI 컴포넌트
```bash
# 추가 필요 컴포넌트
npx shadcn@latest add dialog
npx shadcn@latest add spinner  # 로딩 컴포넌트
npx shadcn@latest add skeleton  # Skeleton UI
```

---

## 6. 환경 변수 템플릿

**`.env.local` (개발 환경)**:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini
GEMINI_API_KEY=AIzaSyXxxxxxxxxxxxxx

# Toss Payments
TOSS_SECRET_KEY=test_sk_xxxxxxxxxxxxx
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxxxxxxxxxxxx

# Cron
CRON_SECRET_TOKEN=your_secure_random_token_here

# App
NODE_ENV=development
```

---

## 7. 개발 가이드라인

### 7.1 코딩 규칙
- **파일명**: kebab-case (예: `toss-payments-client.ts`)
- **컴포넌트명**: PascalCase (예: `MarkdownRenderer`)
- **함수명**: camelCase (예: `analyzeWithGemini`)
- **상수명**: UPPER_SNAKE_CASE (예: `ERROR_MESSAGES`)

### 7.2 디렉토리 규칙
- **공통 로직**: `src/lib/`
- **비즈니스 로직**: `src/features/{feature}/`
- **백엔드**: `src/backend/`
- **UI 컴포넌트**: `src/components/`

### 7.3 타입 정의
- 모든 공통 타입은 `types.ts` 파일로 분리
- API 응답 타입은 `schema.ts` (Zod) → `dto.ts` (타입 재노출)
- 절대 `any` 타입 사용 금지

### 7.4 에러 핸들링
- 모든 API 호출은 try-catch 필수
- 에러 메시지는 `ERROR_MESSAGES` 상수 사용
- 사용자 친화적 에러 메시지 표시
- 에러 로그는 콘솔 + Sentry (선택)

### 7.5 테스트
- 각 모듈은 독립적으로 테스트 가능해야 함
- E2E 테스트는 Phase 1 완료 후 작성
- Mocking 가능한 구조로 설계 (의존성 주입)

---

## 8. 주의사항

### 8.1 보안
- **BillingKey**: 절대 클라이언트에 노출 금지
- **Webhook Secret**: 환경 변수로만 관리
- **Gemini API Key**: 서버 사이드에서만 사용
- **Clerk Secret Key**: 서버 사이드에서만 사용

### 8.2 성능
- Gemini API 호출: 타임아웃 30초 설정
- 토스 결제 위젯: Lazy Load 적용
- 마크다운 파서: 100KB 이상 시 경고 표시
- Cron Job: 100명 기준 30초 이내 완료

### 8.3 데이터베이스
- Supabase RLS 비활성화 (`.ruler/supabase.md` 준수)
- 모든 쿼리는 `clerk_user_id` WHERE 조건 필수
- 트랜잭션 필요 시 Supabase RPC 활용

---

## 9. 마일스톤

### Milestone 1: 핵심 인프라 완료 (D+2)
- Clerk 클라이언트/서버/Webhook 완성
- Gemini API 클라이언트 완성
- 환경 변수 검증 완성

### Milestone 2: 비즈니스 로직 완료 (D+5)
- 토스페이먼츠 클라이언트 완성
- 정기 결제 Cron API 완성
- 마크다운 파서 완성

### Milestone 3: UI/UX 완료 (D+7)
- 공통 레이아웃 (Header/Footer) 완성
- 에러 페이지 (404/403/500) 완성
- 로딩 컴포넌트 완성

### Milestone 4: 유틸리티 완료 (D+8)
- 날짜/시간 포맷 유틸 완성
- Zod 공통 스키마 완성
- 에러 메시지 관리 완성

### Final Milestone: 통합 테스트 완료 (D+9)
- E2E 테스트 통과
- 타입스크립트 빌드 성공
- ESLint 검증 성공
- 페이지 단위 개발 시작 가능

---

## 10. 문서 메타데이터

**작성일**: 2025-10-25
**버전**: 1.0
**작성자**: Claude Code
**검토자**: -
**참고 문서**:
- `/docs/prd.md` - 기술 스택 및 시스템 아키텍처
- `/docs/database.md` - 데이터베이스 스키마
- `/docs/userflow.md` - 사용자 플로우
- `/docs/usecases/` - 각 유스케이스 명세

**다음 단계**: 페이지 단위 개발 (UC-001 ~ UC-006 병렬 진행)
