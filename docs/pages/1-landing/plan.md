# 홈 (Landing) 페이지 구현 계획

**문서 버전**: 1.0
**작성일**: 2025-10-25
**페이지 경로**: `/`
**접근 조건**: 전체 공개

---

## 목차
1. [페이지 개요](#1-페이지-개요)
2. [UI 구성](#2-ui-구성)
3. [사용할 공통 컴포넌트](#3-사용할-공통-컴포넌트)
4. [Clerk 연동](#4-clerk-연동)
5. [반응형 디자인 전략](#5-반응형-디자인-전략)
6. [구현 단계](#6-구현-단계)
7. [테스트 계획](#7-테스트-계획)

---

## 1. 페이지 개요

### 1.1 목적
- 서비스의 가치 제안을 명확히 전달
- Google OAuth를 통한 간편한 회원가입 유도
- 무료 체험(3회)과 Pro 플랜 비교를 통한 전환 유도
- 서비스 신뢰도 구축

### 1.2 주요 기능
1. **히어로 섹션**: 서비스 핵심 가치 전달 및 CTA 버튼
2. **특징 소개**: 3단 그리드 형태로 주요 기능 소개
3. **플랜 비교**: Free vs Pro 플랜 비교표
4. **푸터**: 서비스 정보 및 링크

### 1.3 비즈니스 목표
- **전환율 목표**: 방문자 대비 회원가입 15% 이상
- **이탈률 목표**: 첫 화면 이탈률 50% 이하
- **CTA 클릭률**: 히어로 섹션 CTA 클릭률 25% 이상

### 1.4 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **렌더링**: Server Component (기본) + Client Component (인터랙션)
- **스타일링**: Tailwind CSS + Shadcn UI
- **인증**: Clerk SDK (Client-side)
- **폰트**: 시스템 폰트 (Inter, Pretendard 폴백)

---

## 2. UI 구성

### 2.1 전체 레이아웃

```
┌─────────────────────────────────────────┐
│         Header (공통 컴포넌트)            │
├─────────────────────────────────────────┤
│                                         │
│         Section 1: 히어로               │
│         (서비스 소개 + CTA)              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Section 2: 특징 소개            │
│         (3단 그리드)                     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Section 3: 플랜 비교            │
│         (Free vs Pro)                   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Section 4: CTA 재강조           │
│                                         │
├─────────────────────────────────────────┤
│         Footer (공통 컴포넌트)           │
└─────────────────────────────────────────┘
```

---

### 2.2 Section 1: 히어로 섹션

#### 2.2.1 디자인 명세

**레이아웃**:
```tsx
// 컨테이너: py-24 (96px vertical padding)
// 최대 너비: max-w-7xl mx-auto
// 패딩: px-6 (mobile), px-8 (tablet), px-12 (desktop)

<section className="py-24 bg-gradient-to-b from-purple-50 to-white">
  <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
    <div className="text-center">
      {/* 메인 헤딩 */}
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
        AI가 풀어주는<br />당신만의 사주 이야기
      </h1>

      {/* 서브 헤딩 */}
      <p className="text-lg leading-relaxed text-gray-700 mb-8 max-w-2xl mx-auto">
        Google Gemini AI가 20년 경력 사주 전문가의 통찰력으로
        당신의 사주팔자를 정밀하게 분석합니다.
      </p>

      {/* CTA 버튼 그룹 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-primary text-white shadow-lg hover:shadow-xl">
          무료로 시작하기 (3회 무료)
        </Button>
        <Button size="lg" variant="outline">
          Pro 플랜 알아보기
        </Button>
      </div>

      {/* 신뢰도 지표 */}
      <p className="mt-6 text-sm text-gray-500">
        ✨ 이미 1,000명이 사주풀이를 경험했습니다
      </p>
    </div>
  </div>
</section>
```

#### 2.2.2 인터랙션

| 요소 | 기본 상태 | Hover 상태 | Active 상태 |
|------|----------|-----------|------------|
| **Primary CTA** | `bg-primary shadow-lg` | `shadow-xl scale-105` | `scale-95` |
| **Secondary CTA** | `border-2 border-primary` | `bg-primary text-white` | `scale-95` |

**클릭 이벤트**:
- "무료로 시작하기" 버튼 → `/sign-in` 페이지로 이동
- "Pro 플랜 알아보기" 버튼 → Section 3 (플랜 비교)으로 스크롤

---

### 2.3 Section 2: 특징 소개

#### 2.3.1 디자인 명세

**레이아웃**: 3단 그리드 (모바일 1단, 태블릿 2단, 데스크탑 3단)

```tsx
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
    {/* 섹션 헤더 */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">
        왜 사주풀이인가요?
      </h2>
      <p className="text-base leading-relaxed text-gray-600">
        전문가 수준의 AI 분석으로 정확하고 깊이 있는 사주 해석을 제공합니다
      </p>
    </div>

    {/* 특징 카드 그리드 */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature) => (
        <FeatureCard key={feature.id} {...feature} />
      ))}
    </div>
  </div>
</section>
```

#### 2.3.2 특징 카드 컴포넌트

```tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-base leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  );
}
```

#### 2.3.3 특징 콘텐츠

| 아이콘 | 제목 | 설명 |
|--------|------|------|
| 🤖 | **AI 기반 정밀 분석** | Google Gemini Pro가 천간·지지부터 대운까지 체계적으로 분석합니다 |
| ⚡ | **즉시 확인 가능** | 30초 이내에 마크다운 형식의 정리된 분석 결과를 받아보세요 |
| 📊 | **체계적인 관리** | 과거 분석 이력을 언제든지 다시 확인하고 비교할 수 있습니다 |

---

### 2.4 Section 3: 플랜 비교

#### 2.4.1 디자인 명세

**레이아웃**: 2단 비교 카드 (모바일 1단, 데스크탑 2단)

```tsx
<section className="py-16 bg-gray-50">
  <div className="max-w-5xl mx-auto px-6 md:px-8">
    {/* 섹션 헤더 */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">
        플랜을 선택하세요
      </h2>
      <p className="text-base leading-relaxed text-gray-600">
        무료로 체험해보고, 필요하면 Pro로 업그레이드하세요
      </p>
    </div>

    {/* 플랜 카드 그리드 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PlanCard {...freePlan} />
      <PlanCard {...proPlan} highlighted />
    </div>
  </div>
</section>
```

#### 2.4.2 플랜 카드 컴포넌트

```tsx
interface PlanCardProps {
  name: string;
  price: string;
  quota: string;
  model: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaAction: () => void;
}

function PlanCard({
  name,
  price,
  quota,
  model,
  features,
  highlighted,
  ctaText,
  ctaAction
}: PlanCardProps) {
  return (
    <div className={cn(
      "border rounded-xl p-8 shadow-md transition-all duration-300",
      highlighted
        ? "border-2 border-primary bg-white shadow-xl hover:shadow-2xl"
        : "border-gray-200 bg-white hover:shadow-lg"
    )}>
      {/* 플랜명 */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {name}
      </h3>

      {/* 가격 */}
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        {price !== "무료" && <span className="text-gray-600">/월</span>}
      </div>

      {/* 쿼터 정보 */}
      <p className="text-sm text-gray-600 mb-2">
        📅 {quota}
      </p>
      <p className="text-sm text-gray-600 mb-6">
        🤖 {model}
      </p>

      {/* 특징 목록 */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA 버튼 */}
      <Button
        className={cn(
          "w-full",
          highlighted
            ? "bg-primary text-white shadow-lg"
            : "border-2 border-primary text-primary"
        )}
        onClick={ctaAction}
      >
        {ctaText}
      </Button>
    </div>
  );
}
```

#### 2.4.3 플랜 콘텐츠

**Free 플랜**:
```typescript
const freePlan: PlanCardProps = {
  name: "무료 체험",
  price: "무료",
  quota: "총 3회 분석 가능",
  model: "Gemini 2.5 Flash",
  features: [
    "기본 사주팔자 분석",
    "천간·지지 계산",
    "오행 균형 분석",
    "마크다운 형식 결과"
  ],
  ctaText: "무료로 시작하기",
  ctaAction: () => router.push('/sign-in')
};
```

**Pro 플랜**:
```typescript
const proPlan: PlanCardProps = {
  name: "Pro 구독",
  price: "₩9,900",
  quota: "매월 10회 분석",
  model: "Gemini 2.5 Pro",
  features: [
    "Free 플랜 모든 기능",
    "고급 AI 모델 (Gemini Pro)",
    "더 정교한 대운·세운 분석",
    "무제한 이력 저장",
    "우선 고객 지원"
  ],
  highlighted: true,
  ctaText: "Pro로 시작하기",
  ctaAction: () => router.push('/sign-in')
};
```

---

### 2.5 Section 4: CTA 재강조

#### 2.5.1 디자인 명세

```tsx
<section className="py-16 bg-purple-600">
  <div className="max-w-4xl mx-auto px-6 text-center">
    <h2 className="text-3xl font-semibold text-white mb-4">
      지금 바로 시작하세요
    </h2>
    <p className="text-lg text-purple-100 mb-8">
      Google 계정으로 간편하게 가입하고 무료 분석 3회를 받아보세요
    </p>
    <Button
      size="lg"
      className="bg-white text-primary shadow-xl hover:shadow-2xl"
    >
      무료로 시작하기
    </Button>
  </div>
</section>
```

---

## 3. 사용할 공통 컴포넌트

### 3.1 기존 공통 컴포넌트 (재사용)

| 컴포넌트 | 경로 | 사용 위치 | 비고 |
|---------|------|----------|------|
| **Header** | `/components/layout/header.tsx` | 페이지 상단 | 로그인/비로그인 상태 구분 |
| **Footer** | `/components/layout/footer.tsx` | 페이지 하단 | 서비스 정보 표시 |
| **Button** | `/components/ui/button.tsx` | 모든 CTA | Shadcn UI 기본 컴포넌트 |

### 3.2 신규 페이지 전용 컴포넌트

| 컴포넌트 | 경로 | 목적 |
|---------|------|------|
| **FeatureCard** | `/app/(public)/_components/feature-card.tsx` | 특징 소개 카드 |
| **PlanCard** | `/app/(public)/_components/plan-card.tsx` | 플랜 비교 카드 |

### 3.3 컴포넌트 의존성 다이어그램

```
app/page.tsx (Server Component)
  ├─ components/layout/header.tsx (Client Component)
  ├─ Hero Section (Server Component)
  │   └─ components/ui/button.tsx (Client Component)
  ├─ Features Section (Server Component)
  │   └─ app/(public)/_components/feature-card.tsx (Server Component)
  ├─ Plans Section (Server Component)
  │   └─ app/(public)/_components/plan-card.tsx (Client Component)
  ├─ CTA Section (Server Component)
  │   └─ components/ui/button.tsx (Client Component)
  └─ components/layout/footer.tsx (Server Component)
```

---

## 4. Clerk 연동

### 4.1 인증 상태 확인

**구현 방식**: Server Component에서 Clerk `auth()` 함수 사용

```tsx
// app/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = auth();

  // 이미 로그인한 사용자는 대시보드로 리다이렉트
  if (userId) {
    redirect('/dashboard');
  }

  return <LandingPageContent />;
}
```

### 4.2 로그인 플로우

**CTA 버튼 클릭 시**:

```tsx
// app/(public)/_components/cta-button.tsx
'use client';

import { useRouter } from 'next/navigation';

export function CTAButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push('/sign-in')}
      size="lg"
      className="bg-primary text-white shadow-lg"
    >
      무료로 시작하기
    </Button>
  );
}
```

### 4.3 Clerk 설정 (필요 환경 변수)

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4.4 인증 페이지

**로그인 페이지** (`/app/sign-in/[[...sign-in]]/page.tsx`):
```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}
```

**회원가입 페이지** (`/app/sign-up/[[...sign-up]]/page.tsx`):
```tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}
```

---

## 5. 반응형 디자인 전략

### 5.1 Breakpoints

```
- Mobile: < 768px (1단 레이아웃)
- Tablet: 768px - 1024px (2단 레이아웃)
- Desktop: > 1024px (3단 레이아웃)
```

### 5.2 섹션별 반응형 처리

| 섹션 | Mobile (< 768px) | Tablet (768-1024px) | Desktop (> 1024px) |
|------|------------------|---------------------|-------------------|
| **히어로** | 1단, 패딩 px-6 | 1단, 패딩 px-8 | 1단, 패딩 px-12 |
| **특징** | 1단 그리드 | 2단 그리드 | 3단 그리드 |
| **플랜** | 1단 그리드 | 2단 그리드 | 2단 그리드 |
| **CTA** | 1단, 패딩 px-6 | 1단, 패딩 px-8 | 1단, 패딩 px-12 |

### 5.3 Tailwind 반응형 클래스 적용

```tsx
// 예시: 특징 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {/* 카드 컴포넌트 */}
</div>

// 예시: 히어로 CTA 버튼
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Button size="lg">무료로 시작하기</Button>
  <Button size="lg" variant="outline">Pro 플랜 알아보기</Button>
</div>
```

### 5.4 모바일 최적화

- **터치 타겟 크기**: 최소 44x44px (Shadcn Button 기본 크기 준수)
- **폰트 크기**: 본문 최소 16px (읽기 편한 크기)
- **여백**: 모바일에서 px-6 (24px) 좌우 여백 유지
- **스크롤 성능**: CSS `will-change` 속성 사용 자제

---

## 6. 구현 단계

### 6.1 Phase 1: 기본 구조 (2시간)

#### 작업 내용
1. **페이지 파일 생성**
   - `app/page.tsx` - 메인 랜딩 페이지 (Server Component)
   - `app/(public)/layout.tsx` - 공개 페이지 레이아웃

2. **디렉토리 구조 설정**
   ```
   app/
   ├── page.tsx (Landing Page)
   ├── (public)/
   │   ├── layout.tsx
   │   └── _components/
   │       ├── feature-card.tsx
   │       ├── plan-card.tsx
   │       └── cta-button.tsx
   ├── sign-in/
   │   └── [[...sign-in]]/
   │       └── page.tsx
   └── sign-up/
       └── [[...sign-up]]/
           └── page.tsx
   ```

3. **Clerk 인증 리다이렉트 로직**
   - 로그인 상태 확인
   - 로그인 사용자 → `/dashboard` 리다이렉트

#### 검증 체크리스트
- [ ] `localhost:3000` 접속 시 랜딩 페이지 표시
- [ ] 로그인 사용자는 자동으로 `/dashboard`로 리다이렉트
- [ ] `/sign-in`, `/sign-up` 페이지 정상 작동

---

### 6.2 Phase 2: 히어로 섹션 (1시간)

#### 작업 내용
1. **히어로 섹션 UI 구현**
   - 그라데이션 배경 (`bg-gradient-to-b from-purple-50 to-white`)
   - 중앙 정렬 레이아웃
   - 메인/서브 헤딩
   - CTA 버튼 그룹

2. **CTA 버튼 컴포넌트**
   - `app/(public)/_components/cta-button.tsx` 생성
   - 클릭 시 `/sign-in` 이동
   - Hover/Active 상태 애니메이션

3. **스크롤 CTA 구현**
   - "Pro 플랜 알아보기" 클릭 시 플랜 섹션으로 smooth scroll

#### 검증 체크리스트
- [ ] 히어로 섹션 디자인 명세 준수
- [ ] "무료로 시작하기" 버튼 → `/sign-in` 이동
- [ ] "Pro 플랜 알아보기" 버튼 → 플랜 섹션 스크롤
- [ ] 반응형 동작 확인 (모바일/태블릿/데스크탑)

---

### 6.3 Phase 3: 특징 소개 섹션 (1.5시간)

#### 작업 내용
1. **FeatureCard 컴포넌트**
   - `app/(public)/_components/feature-card.tsx` 생성
   - Props: `icon`, `title`, `description`
   - Hover 애니메이션 (`hover:-translate-y-1`)

2. **특징 데이터 배열**
   ```typescript
   const features = [
     {
       id: 1,
       icon: <Robot className="w-12 h-12" />,
       title: "AI 기반 정밀 분석",
       description: "Google Gemini Pro가 천간·지지부터 대운까지 체계적으로 분석합니다"
     },
     // ... 나머지 2개
   ];
   ```

3. **그리드 레이아웃**
   - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

#### 검증 체크리스트
- [ ] 3개의 특징 카드 정상 표시
- [ ] Hover 시 카드 상승 애니메이션 작동
- [ ] 그리드 반응형 동작 확인 (1→2→3단)

---

### 6.4 Phase 4: 플랜 비교 섹션 (2시간)

#### 작업 내용
1. **PlanCard 컴포넌트**
   - `app/(public)/_components/plan-card.tsx` 생성
   - Props: `name`, `price`, `quota`, `model`, `features`, `highlighted`, `ctaText`, `ctaAction`
   - Pro 플랜 하이라이트 (border-2 border-primary)

2. **플랜 데이터 정의**
   ```typescript
   const freePlan = { ... };
   const proPlan = { ... };
   ```

3. **CTA 로직**
   - 두 플랜 모두 `/sign-in`으로 이동
   - Pro 플랜 버튼 강조 (bg-primary)

#### 검증 체크리스트
- [ ] Free/Pro 플랜 카드 정상 표시
- [ ] Pro 플랜 하이라이트 적용
- [ ] CTA 버튼 클릭 → `/sign-in` 이동
- [ ] 모바일에서 1단, 데스크탑에서 2단 레이아웃

---

### 6.5 Phase 5: CTA 재강조 섹션 (30분)

#### 작업 내용
1. **보라색 배경 섹션**
   - `bg-purple-600`
   - 흰색 텍스트
   - 중앙 정렬

2. **흰색 CTA 버튼**
   - `bg-white text-primary`
   - 큰 그림자 효과

#### 검증 체크리스트
- [ ] 보라색 배경 정상 표시
- [ ] 흰색 버튼 대비 명확
- [ ] 클릭 시 `/sign-in` 이동

---

### 6.6 Phase 6: 통합 및 최적화 (1시간)

#### 작업 내용
1. **성능 최적화**
   - Next.js Image 컴포넌트 사용 (아이콘 제외)
   - Lazy loading 적용 (하단 섹션)
   - 폰트 최적화 (next/font)

2. **접근성 개선**
   - ARIA 라벨 추가
   - 키보드 네비게이션 테스트
   - Color contrast 검증 (WCAG AA)

3. **SEO 메타데이터**
   ```typescript
   export const metadata: Metadata = {
     title: '사주풀이 - AI가 풀어주는 당신만의 사주 이야기',
     description: 'Google Gemini AI로 정밀한 사주팔자 분석. 무료 체험 3회 제공.',
     keywords: ['사주', '사주풀이', 'AI 사주', '무료 사주'],
   };
   ```

#### 검증 체크리스트
- [ ] Lighthouse 성능 점수 90+ (모바일/데스크탑)
- [ ] Lighthouse 접근성 점수 90+
- [ ] SEO 메타데이터 확인
- [ ] Open Graph 이미지 설정

---

## 7. 테스트 계획

### 7.1 단위 테스트

#### TEST-001: FeatureCard 컴포넌트
```typescript
describe('FeatureCard', () => {
  it('should render icon, title, and description', () => {
    const props = {
      icon: <span>🤖</span>,
      title: 'Test Title',
      description: 'Test Description'
    };

    render(<FeatureCard {...props} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should apply hover animation class', () => {
    const { container } = render(<FeatureCard {...mockProps} />);
    const card = container.firstChild;

    expect(card).toHaveClass('hover:-translate-y-1');
  });
});
```

---

#### TEST-002: PlanCard 컴포넌트
```typescript
describe('PlanCard', () => {
  it('should render all plan information', () => {
    const props = {
      name: 'Pro 구독',
      price: '₩9,900',
      quota: '매월 10회',
      model: 'Gemini 2.5 Pro',
      features: ['Feature 1', 'Feature 2'],
      ctaText: 'Pro로 시작하기',
      ctaAction: jest.fn()
    };

    render(<PlanCard {...props} />);

    expect(screen.getByText('Pro 구독')).toBeInTheDocument();
    expect(screen.getByText('₩9,900')).toBeInTheDocument();
  });

  it('should call ctaAction on button click', () => {
    const ctaAction = jest.fn();
    const props = { ...mockProps, ctaAction };

    render(<PlanCard {...props} />);

    const button = screen.getByText('Pro로 시작하기');
    fireEvent.click(button);

    expect(ctaAction).toHaveBeenCalledTimes(1);
  });

  it('should apply highlighted styles when prop is true', () => {
    const { container } = render(<PlanCard {...mockProps} highlighted />);
    const card = container.firstChild;

    expect(card).toHaveClass('border-2', 'border-primary');
  });
});
```

---

### 7.2 통합 테스트

#### TEST-003: 전체 랜딩 페이지 렌더링
```typescript
describe('Landing Page', () => {
  it('should render all sections', async () => {
    render(await LandingPage());

    // 히어로 섹션
    expect(screen.getByText('AI가 풀어주는')).toBeInTheDocument();

    // 특징 섹션
    expect(screen.getByText('왜 사주풀이인가요?')).toBeInTheDocument();

    // 플랜 섹션
    expect(screen.getByText('플랜을 선택하세요')).toBeInTheDocument();

    // CTA 재강조
    expect(screen.getByText('지금 바로 시작하세요')).toBeInTheDocument();
  });
});
```

---

#### TEST-004: 로그인 사용자 리다이렉트
```typescript
describe('Landing Page - Authenticated User', () => {
  it('should redirect logged-in users to dashboard', async () => {
    // Mock Clerk auth
    jest.mock('@clerk/nextjs', () => ({
      auth: jest.fn(() => ({ userId: 'user_123' }))
    }));

    const { redirect } = await import('next/navigation');

    await LandingPage();

    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
```

---

### 7.3 E2E 테스트 (Playwright)

#### TEST-005: 회원가입 플로우
```typescript
test('complete signup flow from landing page', async ({ page }) => {
  // 1. 랜딩 페이지 접속
  await page.goto('http://localhost:3000');

  // 2. "무료로 시작하기" 버튼 클릭
  await page.click('text=무료로 시작하기');

  // 3. 로그인 페이지로 이동 확인
  await expect(page).toHaveURL('/sign-in');

  // 4. Clerk 로그인 위젯 표시 확인
  await expect(page.locator('[data-clerk-sign-in]')).toBeVisible();

  // 5. Google OAuth 버튼 확인
  await expect(page.locator('button:has-text("Google")')).toBeVisible();
});
```

---

#### TEST-006: 플랜 비교 스크롤
```typescript
test('scroll to plans section on CTA click', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // "Pro 플랜 알아보기" 버튼 클릭
  await page.click('text=Pro 플랜 알아보기');

  // 플랜 섹션으로 스크롤 확인
  const plansSection = page.locator('text=플랜을 선택하세요');
  await expect(plansSection).toBeInViewport();
});
```

---

### 7.4 반응형 테스트

#### TEST-007: 모바일 레이아웃
```typescript
test('mobile layout renders correctly', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('http://localhost:3000');

  // 특징 그리드 1단 확인
  const featuresGrid = page.locator('[data-testid="features-grid"]');
  const columns = await featuresGrid.evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );
  expect(columns).toContain('1fr'); // 1단 레이아웃

  // CTA 버튼 세로 배치 확인
  const ctaButtons = page.locator('[data-testid="cta-buttons"]');
  const flexDirection = await ctaButtons.evaluate(el =>
    window.getComputedStyle(el).flexDirection
  );
  expect(flexDirection).toBe('column');
});
```

---

#### TEST-008: 데스크탑 레이아웃
```typescript
test('desktop layout renders correctly', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000');

  // 특징 그리드 3단 확인
  const featuresGrid = page.locator('[data-testid="features-grid"]');
  const columns = await featuresGrid.evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(columns).toBe(3);
});
```

---

### 7.5 성능 테스트

#### TEST-009: Lighthouse 성능 점수
```typescript
test('lighthouse performance score should be > 90', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const lighthouse = await page.evaluate(() => {
    return window.performance.getEntriesByType('navigation')[0];
  });

  const loadTime = lighthouse.loadEventEnd - lighthouse.fetchStart;
  expect(loadTime).toBeLessThan(2000); // 2초 이내 로드
});
```

---

### 7.6 접근성 테스트

#### TEST-010: 키보드 네비게이션
```typescript
test('all interactive elements are keyboard accessible', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Tab 키로 모든 CTA 버튼 접근 가능 확인
  await page.keyboard.press('Tab');
  let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBe('BUTTON');

  await page.keyboard.press('Tab');
  focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBe('BUTTON');
});
```

---

#### TEST-011: ARIA 라벨 검증
```typescript
test('all buttons have accessible names', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const buttons = await page.locator('button').all();

  for (const button of buttons) {
    const accessibleName = await button.getAttribute('aria-label')
                          || await button.textContent();
    expect(accessibleName).not.toBeNull();
  }
});
```

---

## 8. 예상 시간표

| Phase | 작업 내용 | 예상 시간 | 누적 시간 |
|-------|----------|----------|----------|
| **Phase 1** | 기본 구조 | 2시간 | 2시간 |
| **Phase 2** | 히어로 섹션 | 1시간 | 3시간 |
| **Phase 3** | 특징 소개 섹션 | 1.5시간 | 4.5시간 |
| **Phase 4** | 플랜 비교 섹션 | 2시간 | 6.5시간 |
| **Phase 5** | CTA 재강조 섹션 | 30분 | 7시간 |
| **Phase 6** | 통합 및 최적화 | 1시간 | 8시간 |
| **테스트** | 단위/통합/E2E | 2시간 | 10시간 |
| **버퍼** | 예상치 못한 이슈 | 2시간 | **12시간** |

**총 예상 소요 시간**: 10-12시간 (1.5일)

---

## 9. 완료 체크리스트

### 9.1 기능 완성도
- [ ] 모든 섹션 정상 렌더링 (히어로, 특징, 플랜, CTA)
- [ ] CTA 버튼 클릭 시 `/sign-in` 이동
- [ ] 로그인 사용자 자동 리다이렉트 (`/dashboard`)
- [ ] 플랜 비교 카드 2개 정상 표시
- [ ] 특징 카드 3개 정상 표시

### 9.2 디자인 일관성
- [ ] 디자인 시스템 준수 (색상, 타이포그래피, 간격)
- [ ] 모든 버튼 Hover/Active 상태 구현
- [ ] 카드 호버 애니메이션 작동 (shadow-xl, -translate-y-1)
- [ ] 보라색 브랜드 컬러 일관성

### 9.3 반응형 대응
- [ ] 모바일 (< 768px) 레이아웃 정상
- [ ] 태블릿 (768-1024px) 레이아웃 정상
- [ ] 데스크탑 (> 1024px) 레이아웃 정상
- [ ] 터치 타겟 최소 44x44px

### 9.4 접근성
- [ ] Lighthouse 접근성 점수 90+
- [ ] 키보드 네비게이션 가능
- [ ] ARIA 라벨 적용
- [ ] Color contrast WCAG AA 준수

### 9.5 성능
- [ ] Lighthouse 성능 점수 90+ (모바일/데스크탑)
- [ ] 초기 로드 시간 < 2초
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 불필요한 JavaScript 최소화

### 9.6 SEO
- [ ] 메타데이터 설정 (title, description, keywords)
- [ ] Open Graph 이미지
- [ ] robots.txt 설정
- [ ] sitemap.xml 포함

### 9.7 테스트
- [ ] 단위 테스트 통과 (컴포넌트별)
- [ ] 통합 테스트 통과 (페이지 전체)
- [ ] E2E 테스트 통과 (회원가입 플로우)
- [ ] 반응형 테스트 통과

---

## 10. 위험 요소 및 대응 방안

### 10.1 기술적 위험

| 위험 | 발생 확률 | 영향도 | 대응 방안 |
|------|----------|--------|----------|
| **Clerk 인증 지연** | 중간 | 높음 | 로딩 스피너 표시, 타임아웃 에러 처리 |
| **큰 이미지 로딩 지연** | 높음 | 중간 | Next.js Image 최적화, Lazy loading |
| **모바일 레이아웃 깨짐** | 중간 | 높음 | 반응형 테스트 강화, Tailwind breakpoint 엄수 |
| **접근성 미흡** | 중간 | 중간 | Lighthouse 검증, ARIA 라벨 추가 |

### 10.2 일정 위험

| 위험 | 발생 확률 | 영향도 | 대응 방안 |
|------|----------|--------|----------|
| **디자인 변경 요청** | 높음 | 중간 | 컴포넌트 분리로 수정 용이성 확보 |
| **테스트 시간 부족** | 중간 | 높음 | 핵심 테스트 우선 작성, E2E는 추후 보완 |
| **예상치 못한 버그** | 중간 | 중간 | 2시간 버퍼 시간 확보 |

---

## 11. 문서 메타데이터

**작성일**: 2025-10-25
**버전**: 1.0
**작성자**: Claude Code
**검토자**: -

**참고 문서**:
- `/docs/prd.md` - 섹션 5.2.5.1 (홈 페이지 요구사항)
- `/docs/requirement.md` - 섹션 3 (페이지 구조)
- `/docs/userflow.md` - 섹션 1 (로그인 플로우)
- `/docs/common-modules.md` - 공통 컴포넌트 명세
- `/.ruler/design.md` - 디자인 시스템 가이드라인
- `/docs/usecases/1-auth/spec.md` - 인증 유스케이스

**다음 단계**:
- `/docs/pages/2-dashboard/plan.md` 작성
- 또는 홈 페이지 구현 시작

---

**문서 상태**: 승인 대기
**예상 구현 기간**: 1.5일 (10-12시간)
