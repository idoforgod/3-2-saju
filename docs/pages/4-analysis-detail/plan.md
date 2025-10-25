# 분석 상세보기 페이지 구현 계획

**페이지**: `/analysis/[id]`
**문서 버전**: 1.0
**작성일**: 2025-10-25
**목적**: 사주 분석 결과 상세 조회 페이지 구현

---

## 목차
1. [페이지 개요](#1-페이지-개요)
2. [Dynamic Route 처리](#2-dynamic-route-처리)
3. [권한 검증](#3-권한-검증)
4. [Markdown 렌더링](#4-markdown-렌더링)
5. [메타데이터 표시](#5-메타데이터-표시)
6. [에러 처리](#6-에러-처리)
7. [구현 단계](#7-구현-단계)
8. [테스트 계획](#8-테스트-계획)

---

## 1. 페이지 개요

### 1.1 페이지 정보

**경로**: `/analysis/[id]`
**접근 조건**: 로그인 + 본인의 분석만 조회 가능
**주요 기능**:
- 과거에 생성한 사주 분석 결과 조회
- Gemini API가 생성한 마크다운 형식의 분석 내용을 HTML로 변환하여 표시
- 분석 대상자 정보 및 메타데이터 표시
- 목록으로 돌아가기 버튼 제공

### 1.2 사용자 시나리오

**진입 경로**:
1. 대시보드(`/dashboard`)에서 분석 이력 카드 클릭
2. URL 직접 접근 (`/analysis/abc-123-def`)
3. 새 분석 완료 후 자동 리다이렉트

**사용 흐름**:
```
사용자 로그인 확인 → 분석 ID로 데이터 조회 → 본인 소유 확인
→ 마크다운 렌더링 → 분석 결과 표시 → 목록으로 또는 삭제(선택)
```

### 1.3 참고 문서

- **PRD**: `/docs/prd.md` 섹션 5.2.5.4 (분석 상세 페이지 요구사항)
- **Userflow**: `/docs/userflow.md` 섹션 3 (사주 분석 결과 조회 플로우)
- **Usecase**: `/docs/usecases/3-result-view/spec.md` (UC-003 명세)
- **Database**: `/docs/database.md` - `analyses` 테이블 구조
- **Common Modules**: `/docs/common-modules.md` 섹션 3.4 (마크다운 파서)

---

## 2. Dynamic Route 처리

### 2.1 파일 구조

```
src/app/analysis/[id]/
├── page.tsx           # 메인 페이지 (Server Component)
├── analysis-view.tsx  # 클라이언트 컴포넌트 (마크다운 렌더링)
└── loading.tsx        # 로딩 UI (Skeleton)
```

### 2.2 Server Component 구현

**파일**: `src/app/analysis/[id]/page.tsx`

```typescript
// src/app/analysis/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { AnalysisView } from './analysis-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: PageProps) {
  // 1. 인증 확인
  const { userId } = auth();
  if (!userId) {
    redirect('/login');
  }

  // 2. Dynamic Route 파라미터 처리 (Next.js 15+ 대응)
  const { id } = await params;

  // 3. UUID 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound(); // 잘못된 ID 형식
  }

  // 4. Supabase에서 분석 데이터 조회
  const supabase = createSupabaseServerClient();
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  // 5. 데이터 존재 확인
  if (error || !analysis) {
    notFound(); // 404: 존재하지 않는 분석
  }

  // 6. 권한 검증 (본인 소유 확인)
  if (analysis.clerk_user_id !== userId) {
    // 403 페이지로 리다이렉트 (또는 커스텀 에러 페이지)
    redirect('/forbidden?reason=not_owner');
  }

  // 7. 클라이언트 컴포넌트로 데이터 전달
  return <AnalysisView analysis={analysis} />;
}
```

**주요 구현 포인트**:
- ✅ Next.js 15에서 `params`는 Promise이므로 `await params` 필요
- ✅ UUID 형식 검증으로 잘못된 요청 조기 차단
- ✅ Supabase service-role key로 서버 사이드에서 안전하게 조회
- ✅ 권한 검증 후 클라이언트 컴포넌트로 데이터 전달

### 2.3 타입 정의

**파일**: `src/features/analysis/types.ts`

```typescript
// src/features/analysis/types.ts
export interface Analysis {
  id: string;
  clerk_user_id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string | null; // HH:MM or null
  gender: 'male' | 'female';
  result_markdown: string;
  model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  created_at: string; // ISO 8601 timestamp
}
```

---

## 3. 권한 검증

### 3.1 검증 전략

**Server Component에서 검증 (권장)**:
- 서버 사이드에서 Clerk `auth()`와 Supabase 데이터를 비교
- 권한 없는 경우 클라이언트에 데이터를 전달하지 않음
- 403 Forbidden 페이지로 리다이렉트

**장점**:
- 민감한 데이터가 클라이언트로 전송되지 않음
- 네트워크 오버헤드 최소화
- SEO 친화적 (검색 엔진이 403 상태를 인식)

### 3.2 403 Forbidden 페이지

**파일**: `src/app/forbidden/page.tsx`

```typescript
// src/app/forbidden/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getMessage = () => {
    switch (reason) {
      case 'not_owner':
        return '본인의 분석 결과만 조회할 수 있습니다.';
      default:
        return '접근 권한이 없습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">403</h1>
        <p className="text-xl text-gray-700 mb-6">{getMessage()}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button>대시보드로 이동</Button>
          </Link>
          <Link href="/analysis/new">
            <Button variant="outline">새 분석하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 404 Not Found 페이지 (기존 활용)

**파일**: `src/app/not-found.tsx` (이미 존재)

```typescript
// src/app/not-found.tsx (기존 파일 확장)
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          요청하신 분석 결과를 찾을 수 없습니다.
        </p>
        <Link href="/dashboard">
          <Button>대시보드로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## 4. Markdown 렌더링

### 4.1 Markdown Parser 활용

**의존성**: `/docs/common-modules.md` 섹션 3.4에서 정의된 마크다운 파서 사용

**파일**: `src/lib/markdown/parser.tsx` (공통 모듈에서 구현됨)

```typescript
// src/lib/markdown/parser.tsx (공통 모듈)
'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      className="prose prose-purple max-w-none"
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mb-3 text-gray-800 mt-6">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mb-2 text-gray-700 mt-4">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 pl-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 pl-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-700">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-purple-700">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-600">{children}</em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 my-4">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-purple-600">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

### 4.2 XSS 방지

**보안 조치**:
1. **rehype-sanitize**: HTML 태그 자동 이스케이프
2. **허용된 태그만 렌더링**: `<script>`, `<iframe>` 등 위험 태그 차단
3. **react-markdown**: `dangerouslySetInnerHTML` 사용하지 않음

**검증**:
```typescript
// 테스트 케이스: XSS 공격 시도
const maliciousMarkdown = `
# 테스트
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')" />
`;
// 결과: <script> 태그는 제거되고, onerror는 무시됨
```

### 4.3 에러 핸들링

**파일**: `src/app/analysis/[id]/analysis-view.tsx`

```typescript
'use client';

import { MarkdownRenderer } from '@/lib/markdown/parser';
import { Analysis } from '@/features/analysis/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function AnalysisView({ analysis }: { analysis: Analysis }) {
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    // 마크다운 파싱 오류 감지
    if (!analysis.result_markdown || analysis.result_markdown.trim() === '') {
      setParseError(true);
      toast.error('분석 결과를 표시할 수 없습니다.');
    }
  }, [analysis]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 메타데이터 카드 (섹션 5 참고) */}

      {/* 분석 결과 본문 */}
      <div className="bg-white rounded-xl shadow-md p-8 mt-6">
        {parseError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">분석 결과를 불러올 수 없습니다.</p>
            <pre className="bg-gray-100 p-4 rounded text-left overflow-x-auto text-sm">
              {analysis.result_markdown}
            </pre>
          </div>
        ) : (
          <MarkdownRenderer content={analysis.result_markdown} />
        )}
      </div>
    </div>
  );
}
```

---

## 5. 메타데이터 표시

### 5.1 분석 정보 카드 UI

**파일**: `src/app/analysis/[id]/analysis-view.tsx` (계속)

```typescript
import { formatDate, formatTime } from '@/lib/utils/date';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AnalysisView({ analysis }: { analysis: Analysis }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 헤더: 분석 대상 정보 */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {analysis.name}님의 사주 분석
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={analysis.model_used === 'gemini-2.5-pro' ? 'default' : 'secondary'}>
                {analysis.model_used === 'gemini-2.5-pro' ? 'Pro 모델' : 'Flash 모델'}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatDate(analysis.created_at)}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <Link href="/dashboard">
            <Button variant="outline">목록으로</Button>
          </Link>
        </div>

        {/* 분석 대상 상세 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">생년월일</p>
            <p className="text-base font-semibold text-gray-900">
              {formatDate(analysis.birth_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">출생 시간</p>
            <p className="text-base font-semibold text-gray-900">
              {analysis.birth_time ? formatTime(analysis.birth_time) : '미상'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">성별</p>
            <p className="text-base font-semibold text-gray-900">
              {analysis.gender === 'male' ? '남성' : '여성'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">분석 일시</p>
            <p className="text-base font-semibold text-gray-900">
              {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </Card>

      {/* 분석 결과 본문 */}
      <Card className="p-8">
        <MarkdownRenderer content={analysis.result_markdown} />
      </Card>
    </div>
  );
}
```

### 5.2 날짜/시간 포맷 유틸리티

**파일**: `src/lib/utils/date.ts` (공통 모듈에서 구현됨)

```typescript
// src/lib/utils/date.ts
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko });
}

export function formatTime(time: string): string {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? '오후' : '오전';
  const hour12 = hourNum % 12 || 12;
  return `${ampm} ${hour12}시 ${minute}분`;
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko });
}
```

---

## 6. 에러 처리

### 6.1 에러 타입별 처리 전략

| 에러 타입 | HTTP 상태 | 처리 방법 | 사용자 메시지 |
|----------|----------|----------|-------------|
| 잘못된 ID 형식 | 404 | `notFound()` | "올바르지 않은 분석 ID입니다" |
| 분석 데이터 없음 | 404 | `notFound()` | "존재하지 않는 분석입니다" |
| 권한 없음 | 403 | `redirect('/forbidden')` | "본인의 분석만 조회할 수 있습니다" |
| DB 연결 오류 | 500 | `error.tsx` | "일시적인 오류가 발생했습니다" |
| 마크다운 파싱 오류 | - | 원본 텍스트 표시 | "일부 내용이 정상적으로 표시되지 않을 수 있습니다" |

### 6.2 Error Boundary 구현

**파일**: `src/app/analysis/[id]/error.tsx`

```typescript
// src/app/analysis/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (Sentry 등)
    console.error('Analysis page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          오류가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            이전 페이지
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 6.3 Loading UI (Skeleton)

**파일**: `src/app/analysis/[id]/loading.tsx`

```typescript
// src/app/analysis/[id]/loading.tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 헤더 Skeleton */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </Card>

      {/* 본문 Skeleton */}
      <Card className="p-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />

        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </Card>
    </div>
  );
}
```

---

## 7. 구현 단계

### 7.1 Phase 1: 기본 구조 (1일차)

**작업 내용**:
1. 디렉토리 구조 생성 (`src/app/analysis/[id]/`)
2. Server Component 구현 (`page.tsx`)
   - Dynamic Route 파라미터 처리
   - 인증 확인 (Clerk `auth()`)
   - UUID 형식 검증
3. 타입 정의 (`src/features/analysis/types.ts`)
4. 403 Forbidden 페이지 구현 (`src/app/forbidden/page.tsx`)

**검증**:
- [ ] `/analysis/invalid-id` 접근 시 404 페이지 표시
- [ ] 비로그인 시 `/login`으로 리다이렉트
- [ ] 다른 사용자 분석 접근 시 403 페이지 표시

### 7.2 Phase 2: 데이터 조회 및 권한 검증 (1일차)

**작업 내용**:
1. Supabase 쿼리 구현 (`analyses` 테이블 조회)
2. 권한 검증 로직 (`clerk_user_id` 일치 확인)
3. 에러 핸들링 (404, 403, 500)
4. Error Boundary 구현 (`error.tsx`)
5. Loading UI 구현 (`loading.tsx`)

**검증**:
- [ ] 본인 소유 분석만 조회 가능
- [ ] 존재하지 않는 ID 접근 시 404 표시
- [ ] DB 연결 오류 시 Error Boundary 작동

### 7.3 Phase 3: Markdown 렌더링 (1일차)

**작업 내용**:
1. 공통 모듈 마크다운 파서 활용 (`src/lib/markdown/parser.tsx`)
2. Client Component 구현 (`analysis-view.tsx`)
3. XSS 방지 검증 (rehype-sanitize)
4. 마크다운 파싱 오류 처리 (원본 텍스트 표시)

**검증**:
- [ ] 마크다운 → HTML 변환 정상 작동
- [ ] `<script>` 태그 등 위험 요소 제거
- [ ] 파싱 오류 시 원본 텍스트 표시

### 7.4 Phase 4: 메타데이터 및 UI (0.5일차)

**작업 내용**:
1. 분석 정보 카드 UI 구현
2. 날짜/시간 포맷 유틸리티 적용 (`formatDate`, `formatTime`)
3. 액션 버튼 (목록으로 돌아가기)
4. 반응형 디자인 적용 (모바일 최적화)

**검증**:
- [ ] 모든 메타데이터 정상 표시 (이름, 생년월일, 성별 등)
- [ ] 모바일에서 레이아웃 정상 표시
- [ ] "목록으로" 버튼 클릭 시 `/dashboard`로 이동

### 7.5 Phase 5: 통합 테스트 (0.5일차)

**작업 내용**:
1. E2E 테스트 시나리오 실행
2. 다양한 에러 케이스 검증
3. 성능 테스트 (마크다운 렌더링 속도)
4. 접근성 테스트 (스크린 리더, 키보드 네비게이션)

**검증**:
- [ ] 모든 테스트 케이스 통과 (섹션 8 참고)
- [ ] 페이지 로딩 시간 < 1초
- [ ] 마크다운 렌더링 < 200ms (100KB 기준)

**총 예상 시간**: 3일

---

## 8. 테스트 계획

### 8.1 기능 테스트

| 테스트 케이스 | 입력 | 기대 결과 | 우선순위 |
|-------------|------|----------|---------|
| TC-004-01 | 본인 소유의 유효한 분석 ID | 분석 결과 페이지 정상 표시 | P0 |
| TC-004-02 | 존재하지 않는 분석 ID | 404 페이지 표시 | P0 |
| TC-004-03 | 잘못된 UUID 형식 | 404 페이지 표시 | P1 |
| TC-004-04 | 다른 사용자의 분석 ID | 403 페이지 표시 | P0 |
| TC-004-05 | 비로그인 상태에서 접근 | `/login`으로 리다이렉트 | P0 |
| TC-004-06 | 마크다운 파싱 오류 | 원본 텍스트 표시 + 경고 메시지 | P1 |
| TC-004-07 | DB 연결 오류 | Error Boundary 표시 + "다시 시도" 버튼 | P1 |

### 8.2 보안 테스트

| 테스트 케이스 | 시나리오 | 기대 결과 |
|-------------|---------|----------|
| SEC-001 | `<script>alert('XSS')</script>` 포함된 마크다운 | `<script>` 태그 제거, 알림 미실행 |
| SEC-002 | 타인의 분석 ID로 직접 URL 접근 | 403 페이지 표시, 데이터 노출 없음 |
| SEC-003 | SQL Injection 시도 (ID에 `'; DROP TABLE--` 입력) | UUID 검증 실패로 404 처리 |

### 8.3 성능 테스트

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| 초기 로딩 시간 | < 1초 | Lighthouse Performance Score |
| 마크다운 렌더링 | < 200ms (100KB) | Chrome DevTools Performance |
| Skeleton UI 표시 | 즉시 | 체감 성능 평가 |
| 메모리 사용량 | < 50MB | Chrome DevTools Memory Profiler |

### 8.4 접근성 테스트

| 항목 | 검증 방법 | 기준 |
|------|----------|------|
| 키보드 네비게이션 | Tab/Enter 키로 모든 버튼 접근 가능 | WCAG 2.1 AA |
| 스크린 리더 | NVDA/VoiceOver로 모든 내용 읽기 가능 | WCAG 2.1 AA |
| 색상 대비 | 텍스트와 배경 명암비 4.5:1 이상 | WCAG 2.1 AA |
| Focus Indicator | 포커스된 요소에 명확한 테두리 표시 | WCAG 2.1 AA |

### 8.5 회귀 테스트 (Regression)

**변경 후 재검증 항목**:
- [ ] 대시보드에서 분석 카드 클릭 → 상세 페이지 정상 이동
- [ ] 새 분석 완료 후 자동 리다이렉트 → 결과 페이지 정상 표시
- [ ] 다른 페이지에서 뒤로가기 버튼 → 이전 상태 유지

---

## 9. 주의사항

### 9.1 보안

- ✅ **XSS 방지**: `rehype-sanitize`로 모든 HTML 태그 이스케이프
- ✅ **권한 검증**: Server Component에서 `clerk_user_id` 일치 확인
- ✅ **데이터 노출 방지**: 권한 없는 경우 클라이언트로 데이터 전송 금지
- ✅ **UUID 검증**: 정규식으로 잘못된 ID 조기 차단

### 9.2 성능

- ✅ **Server Component 활용**: 초기 렌더링 시 이미 데이터 포함
- ✅ **Lazy Loading**: 이미지가 있는 경우 `loading="lazy"` 속성 사용
- ✅ **Skeleton UI**: 로딩 중에도 레이아웃 유지로 CLS 방지
- ✅ **마크다운 캐싱**: 동일 분석 재조회 시 브라우저 캐시 활용

### 9.3 사용자 경험

- ✅ **명확한 에러 메시지**: 404/403 페이지에서 다음 액션 안내
- ✅ **접근성**: 스크린 리더 사용자도 모든 내용 접근 가능
- ✅ **모바일 최적화**: 긴 마크다운도 스크롤 가능하게 표시
- ✅ **로딩 피드백**: Skeleton UI로 로딩 상태 명확히 표시

### 9.4 코드베이스 규칙 준수

- ✅ **Client Component 최소화**: 마크다운 렌더링만 Client Component
- ✅ **절대 경로 사용**: `@/` alias로 import 경로 통일
- ✅ **타입 안전성**: 모든 props에 타입 정의 (`Analysis` 인터페이스)
- ✅ **에러 핸들링**: try-catch 없이 Next.js Error Boundary 활용

---

## 10. 문서 정보

- **버전**: 1.0
- **작성일**: 2025-10-25
- **작성자**: Claude Code
- **참고 문서**:
  - `/docs/prd.md` - 섹션 5.2.5.4 (분석 상세 페이지 요구사항)
  - `/docs/userflow.md` - 섹션 3 (사주 분석 결과 조회 플로우)
  - `/docs/usecases/3-result-view/spec.md` - UC-003 명세
  - `/docs/database.md` - `analyses` 테이블 구조
  - `/docs/common-modules.md` - 마크다운 파서 공통 모듈
- **다음 단계**: 구현 시작 (Phase 1부터 순차 진행)
