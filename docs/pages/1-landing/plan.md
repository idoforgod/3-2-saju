# 랜딩 페이지 (`/`) 구현 계획

**작성일**: 2025-10-26
**버전**: 1.0
**우선순위**: P0 (MVP 필수)
**담당 경로**: `src/app/page.tsx`, `src/app/_components/`

---

## 목차

1. [페이지 개요](#1-페이지-개요)
2. [페이지 구조](#2-페이지-구조)
3. [컴포넌트 목록](#3-컴포넌트-목록)
4. [API 연동](#4-api-연동)
5. [상태 관리 전략](#5-상태-관리-전략)
6. [라우팅 및 네비게이션](#6-라우팅-및-네비게이션)
7. [구현 단계](#7-구현-단계)
8. [검증 체크리스트](#8-검증-체크리스트)

---

## 1. 페이지 개요

### 1.1 목적
- 신규 방문자에게 서비스 가치 제안
- Google 로그인 전환 유도 (무료 3회 체험)
- Pro 구독 플랜 소개

### 1.2 목표 지표
- **로그인 전환율**: 30% 이상
- **페이지 로딩 시간**: 2초 이내 (LCP)
- **모바일 최적화**: 완벽한 반응형 디자인

### 1.3 접근 권한
- **비로그인 사용자**: 전체 접근 가능
- **로그인 사용자**: 자동으로 `/dashboard` 리다이렉트

---

## 2. 페이지 구조

### 2.1 레이아웃 구성

```
┌──────────────────────────────────────┐
│  Header (로그인/회원가입 버튼)        │
├──────────────────────────────────────┤
│                                      │
│  Hero Section                        │
│  - 메인 헤드라인                     │
│  - 서브 헤드라인                     │
│  - CTA 버튼 (무료 시작하기)          │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  Features Section (4개 특징)         │
│  - ⏱️ 즉시 분석                      │
│  - 🤖 Gemini AI 기반                 │
│  - 💰 합리적인 가격                  │
│  - 📊 분석 이력 보관                 │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  Pricing Section                     │
│  - 무료 플랜 (3회 체험)              │
│  - Pro 플랜 (월 9,900원)             │
│  - 비교표                            │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  CTA Section                         │
│  - 마지막 전환 유도                  │
│                                      │
├──────────────────────────────────────┤
│  Footer (회사 정보, 이용약관)         │
└──────────────────────────────────────┘
```

### 2.2 색상 및 디자인 시스템
- **Primary**: Purple (hsl(270 60% 50%))
- **배경**: 그라데이션 (Purple-50 → White)
- **폰트**:
  - 제목: Bold, Tracking-tight
  - 본문: Leading-relaxed
- **간격**: 일관된 4px 배수 사용

---

## 3. 컴포넌트 목록

### 3.1 기존 구현 상태 분석

#### ✅ 이미 구현된 컴포넌트
| 컴포넌트 | 경로 | 상태 | 비고 |
|---------|------|------|------|
| `Header` | `src/components/layout/header.tsx` | 완료 | Clerk 연동 필요 |
| `Footer` | `src/components/layout/footer.tsx` | 완료 | 내용 확인 필요 |
| `HeroSection` | `src/app/_components/hero-section.tsx` | 완료 | 기본 구조 완성 |
| `FeaturesSection` | `src/app/_components/features-section.tsx` | 완료 | 내용 확인 필요 |
| `PlansSection` | `src/app/_components/plans-section.tsx` | 완료 | 가격 정보 확인 |
| `CTASection` | `src/app/_components/cta-section.tsx` | 완료 | 최종 전환 유도 |

#### ⚠️ 수정 필요 사항

**1. `page.tsx` (메인 랜딩 페이지)**
- **현재 상태**:
  - `useCurrentUser` 훅 사용 중 (기존 인증 시스템)
  - 로그인 사용자는 `/dashboard`로 리다이렉트
- **수정 방향**:
  - **Clerk 연동**: `useCurrentUser` → Clerk의 `useAuth` 훅으로 교체
  - 인증 상태 확인 로직 변경

**2. `Header` 컴포넌트**
- **현재 상태**: Clerk `useUser`, `UserButton` 사용 중
- **문제**: Clerk 환경 변수 미설정 시 동작하지 않을 수 있음
- **확인 사항**:
  - `.env.local`에 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정 확인
  - 로그인 경로: `/sign-in`, `/sign-up` (Clerk 기본 경로)

**3. `HeroSection` 컴포넌트**
- **현재 상태**: `/login` 경로로 라우팅
- **수정 필요**: `/sign-in`으로 변경 (Clerk 경로 규칙 준수)

---

### 3.2 컴포넌트 상세 설계

#### 3.2.1 `page.tsx` (메인 페이지)

**수정 전 (현재)**:
```typescript
const { isAuthenticated, isLoading } = useCurrentUser();
```

**수정 후 (Clerk 연동)**:
```typescript
import { useAuth } from '@clerk/nextjs';

const { isSignedIn, isLoaded } = useAuth();

useEffect(() => {
  if (isLoaded && isSignedIn) {
    router.replace("/dashboard");
  }
}, [isLoaded, isSignedIn, router]);

if (!isLoaded || isSignedIn) {
  return null; // 로딩 중이거나 로그인 사용자는 빈 화면
}
```

**책임**:
- ✅ 로그인 상태 확인
- ✅ 로그인 사용자 자동 리다이렉트
- ✅ 섹션 컴포넌트 배치

**Props**: 없음 (최상위 페이지)

---

#### 3.2.2 `Header` 컴포넌트

**현재 구현**:
```typescript
import { useUser, UserButton } from '@clerk/nextjs';
```

**확인 사항**:
- ✅ Clerk 훅 사용 중
- ✅ 로그인/비로그인 상태별 UI 분기
- ⚠️ 로그인 경로: `/sign-in`, `/sign-up` (Clerk 규칙)

**수정 필요 없음** (이미 Clerk 연동 완료)

**책임**:
- ✅ 로고 표시
- ✅ 비로그인: "로그인", "시작하기" 버튼
- ✅ 로그인: "내 분석", "새 분석", "구독 관리", UserButton

---

#### 3.2.3 `HeroSection` 컴포넌트

**수정 전 (현재)**:
```typescript
onClick={() => router.push("/login")}
```

**수정 후**:
```typescript
onClick={() => router.push("/sign-in")}
```

**책임**:
- ✅ 메인 헤드라인: "AI가 풀어주는 당신만의 사주 이야기"
- ✅ 서브 헤드라인: "Google Gemini AI가..."
- ✅ CTA 버튼 2개:
  - Primary: "무료로 시작하기 (3회 무료)" → `/sign-in`
  - Secondary: "Pro 플랜 알아보기" → Smooth Scroll to `#plans-section`
- ✅ 신뢰도 지표: "✨ 이미 1,000명이 사주풀이를 경험했습니다"

**Props**: 없음 (독립적 섹션)

---

#### 3.2.4 `FeaturesSection` 컴포넌트

**확인 사항**:
- 4개 특징 카드 표시
  1. ⏱️ **즉시 분석**: 30초 이내 결과 제공
  2. 🤖 **Gemini AI 기반**: 전문 상담사 수준의 분석
  3. 💰 **합리적인 가격**: 무료 3회 + 월 9,900원
  4. 📊 **분석 이력 보관**: 과거 분석 무제한 조회

**책임**:
- 특징 카드 그리드 레이아웃 (4열 → 모바일 1열)
- 아이콘 + 제목 + 설명 구조

**Props**: 없음

**수정 필요 여부**: 내용 확인 후 결정

---

#### 3.2.5 `PlansSection` 컴포넌트

**확인 사항**:
- 2개 플랜 비교 카드
  - **무료 플랜**:
    - 가격: 0원
    - 쿼터: 총 3회 (1회성)
    - 모델: Gemini Flash
    - 특징: 무료 체험
  - **Pro 플랜**:
    - 가격: 월 9,900원
    - 쿼터: 월 10회
    - 모델: Gemini Pro
    - 특징: 고품질 분석

**책임**:
- 플랜 비교표 렌더링
- CTA 버튼: "무료로 시작하기" / "Pro 구독하기"

**Props**: 없음

**수정 필요 여부**: 가격 정보 확인 후 결정

---

#### 3.2.6 `CTASection` 컴포넌트

**목적**: 마지막 전환 유도

**책임**:
- 강력한 CTA 문구: "지금 바로 시작하세요"
- 버튼: "무료로 시작하기" → `/sign-in`

**Props**: 없음

**수정 필요 여부**: 내용 확인 후 결정

---

#### 3.2.7 `Footer` 컴포넌트

**확인 사항**:
- 회사 정보
- 이용약관
- 개인정보처리방침
- 소셜 미디어 링크 (선택)

**책임**:
- 푸터 정보 표시
- 법적 고지사항

**Props**: 없음

**수정 필요 여부**: 내용 확인 후 결정

---

## 4. API 연동

### 4.1 필요한 API 없음

랜딩 페이지는 **정적 콘텐츠**만 표시하므로 API 연동이 필요 없습니다.

**인증 상태 확인**:
- Clerk SDK의 클라이언트 사이드 훅 사용 (`useAuth`)
- 서버 API 호출 없이 JWT 토큰 자동 검증

---

## 5. 상태 관리 전략

### 5.1 로컬 상태

**사용하지 않음**
- 모든 컴포넌트는 Props 없이 독립적으로 동작
- 정적 콘텐츠만 렌더링

### 5.2 인증 상태

**Clerk SDK 활용**:
```typescript
const { isSignedIn, isLoaded } = useAuth();
```

**상태 관리 플로우**:
```
1. 페이지 로드
2. Clerk SDK 초기화 (isLoaded = false)
3. JWT 토큰 검증 완료 (isLoaded = true)
4. 인증 상태 확인 (isSignedIn = true/false)
5. 조건부 렌더링:
   - isSignedIn = true → /dashboard 리다이렉트
   - isSignedIn = false → 랜딩 페이지 표시
```

### 5.3 전역 상태

**사용하지 않음**
- Context API, Zustand 등 불필요
- Clerk가 인증 상태 자동 관리

---

## 6. 라우팅 및 네비게이션

### 6.1 내부 링크

| 링크 텍스트 | 대상 경로 | 조건 |
|------------|---------|------|
| "무료로 시작하기" | `/sign-in` | 비로그인 사용자 |
| "Pro 플랜 알아보기" | `#plans-section` (Smooth Scroll) | 모든 사용자 |
| "로그인" | `/sign-in` | 비로그인 사용자 |
| "시작하기" | `/sign-up` | 비로그인 사용자 |
| "내 분석" | `/dashboard` | 로그인 사용자 |
| "새 분석" | `/analysis/new` | 로그인 사용자 |
| "구독 관리" | `/subscription` | 로그인 사용자 |

### 6.2 자동 리다이렉트

**조건**: `isSignedIn = true`
**대상**: `/dashboard`
**방법**: `router.replace()` (뒤로가기 방지)

```typescript
useEffect(() => {
  if (isLoaded && isSignedIn) {
    router.replace("/dashboard");
  }
}, [isLoaded, isSignedIn, router]);
```

### 6.3 Smooth Scroll

**대상**: `#plans-section`
**구현**:
```typescript
const handleScrollToPlans = () => {
  const plansSection = document.getElementById("plans-section");
  if (plansSection) {
    plansSection.scrollIntoView({ behavior: "smooth" });
  }
};
```

---

## 7. 구현 단계

### Phase 1: Clerk 연동 (30분)

**작업 항목**:
1. ✅ `.env.local`에 Clerk 환경 변수 설정 확인
2. ✅ `page.tsx`: `useCurrentUser` → `useAuth` 교체
3. ✅ `HeroSection`: `/login` → `/sign-in` 경로 변경
4. ✅ `Header`: 이미 Clerk 연동 완료 (수정 불필요)

**검증**:
- [ ] Clerk 로그인 위젯 정상 표시
- [ ] 로그인 후 `/dashboard` 리다이렉트 동작
- [ ] 비로그인 상태에서 랜딩 페이지 정상 표시

---

### Phase 2: 컴포넌트 내용 검토 (1시간)

**작업 항목**:
1. ✅ `FeaturesSection`: 4개 특징 내용 확인 및 수정
2. ✅ `PlansSection`: 가격 정보 확인 (무료 3회 / Pro 월 9,900원)
3. ✅ `CTASection`: 전환 유도 문구 확인
4. ✅ `Footer`: 법적 고지사항 확인

**검증**:
- [ ] 모든 텍스트 정보가 PRD와 일치
- [ ] 가격 정보 정확성 확인
- [ ] 오타 및 띄어쓰기 확인

---

### Phase 3: 디자인 시스템 적용 (1시간)

**작업 항목**:
1. ✅ 색상: Purple 계열 일관성 확인
2. ✅ 폰트: Bold, Tracking-tight 적용 확인
3. ✅ 간격: 4px 배수 사용 확인
4. ✅ 그림자: Purple-tinted shadow 적용
5. ✅ 반응형: Mobile-first 디자인 확인

**검증**:
- [ ] Tailwind CSS 클래스 일관성
- [ ] 모바일 (< 768px) 레이아웃 정상
- [ ] 태블릿 (768px - 1024px) 레이아웃 정상
- [ ] 데스크톱 (> 1024px) 레이아웃 정상

---

### Phase 4: 성능 최적화 (30분)

**작업 항목**:
1. ✅ 이미지 최적화: Next.js `<Image>` 컴포넌트 사용 (필요 시)
2. ✅ 폰트 최적화: `next/font` 사용 확인
3. ✅ 코드 스플리팅: `"use client"` 지시자 최소화
4. ✅ Lighthouse 성능 점수 측정

**목표**:
- LCP (Largest Contentful Paint): < 2초
- CLS (Cumulative Layout Shift): < 0.1
- Performance Score: > 90

---

### Phase 5: 최종 검증 (30분)

**작업 항목**:
1. ✅ E2E 테스트:
   - 비로그인 사용자 → 랜딩 페이지 표시 → "무료로 시작하기" 클릭 → Clerk 로그인
   - 로그인 사용자 → `/` 접근 → `/dashboard` 리다이렉트
2. ✅ 브라우저 테스트:
   - Chrome, Firefox, Safari
3. ✅ 디바이스 테스트:
   - iPhone (375px)
   - iPad (768px)
   - Desktop (1280px)

---

## 8. 검증 체크리스트

### 8.1 기능 검증

- [ ] **비로그인 사용자**:
  - [ ] 랜딩 페이지 정상 표시
  - [ ] "무료로 시작하기" 클릭 → `/sign-in` 이동
  - [ ] "Pro 플랜 알아보기" 클릭 → Smooth Scroll 동작
  - [ ] Header "로그인" 버튼 → `/sign-in` 이동
  - [ ] Header "시작하기" 버튼 → `/sign-up` 이동

- [ ] **로그인 사용자**:
  - [ ] `/` 접근 시 즉시 `/dashboard` 리다이렉트
  - [ ] Header에 "내 분석", "새 분석", "구독 관리", UserButton 표시

### 8.2 디자인 검증

- [ ] **색상 시스템**:
  - [ ] Primary Purple (hsl(270 60% 50%)) 일관성
  - [ ] Gradient 배경 (Purple-50 → White)
  - [ ] Purple-tinted shadow 적용

- [ ] **타이포그래피**:
  - [ ] 제목: Bold, Tracking-tight
  - [ ] 본문: Leading-relaxed
  - [ ] 계층 구조 명확 (H1 → H2 → H3 → Body)

- [ ] **간격**:
  - [ ] 섹션 간: 96px (`py-24`)
  - [ ] 카드 간: 24px (`gap-6`)
  - [ ] 일관된 4px 배수 사용

- [ ] **반응형**:
  - [ ] Mobile (< 768px): 1열 레이아웃
  - [ ] Tablet (768px - 1024px): 2열 레이아웃
  - [ ] Desktop (> 1024px): 4열 레이아웃

### 8.3 성능 검증

- [ ] **Lighthouse 점수**:
  - [ ] Performance: > 90
  - [ ] Accessibility: > 95
  - [ ] Best Practices: > 90
  - [ ] SEO: > 90

- [ ] **Core Web Vitals**:
  - [ ] LCP (Largest Contentful Paint): < 2초
  - [ ] FID (First Input Delay): < 100ms
  - [ ] CLS (Cumulative Layout Shift): < 0.1

- [ ] **로딩 시간**:
  - [ ] 초기 페이지 로드: < 2초
  - [ ] Clerk SDK 초기화: < 1초

### 8.4 접근성 검증

- [ ] **키보드 네비게이션**:
  - [ ] 모든 버튼 Tab 이동 가능
  - [ ] Enter 키로 버튼 클릭 가능
  - [ ] Focus Indicator 명확

- [ ] **스크린 리더**:
  - [ ] Semantic HTML 사용 (`<header>`, `<main>`, `<section>`, `<footer>`)
  - [ ] 모든 이미지에 `alt` 텍스트 (필요 시)
  - [ ] ARIA labels (필요 시)

- [ ] **색상 대비**:
  - [ ] 텍스트-배경 대비: 4.5:1 이상
  - [ ] 버튼-배경 대비: 3:1 이상

### 8.5 브라우저 호환성

- [ ] **Chrome**: 최신 버전
- [ ] **Firefox**: 최신 버전
- [ ] **Safari**: 최신 버전
- [ ] **Edge**: 최신 버전
- [ ] **모바일 Safari**: iOS 15+
- [ ] **모바일 Chrome**: Android 10+

---

## 9. 주의사항

### 9.1 Clerk 연동

- **로그인 경로**: `/sign-in`, `/sign-up` (Clerk 기본 경로 사용)
- **환경 변수**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 필수
- **Webhook**: 랜딩 페이지에서는 불필요 (가입 시 자동 처리)

### 9.2 성능

- **정적 콘텐츠**: API 호출 없이 빠른 로딩
- **이미지 최적화**: Next.js `<Image>` 사용 (필요 시)
- **코드 스플리팅**: 모든 섹션 컴포넌트는 Client Component (`"use client"`)

### 9.3 SEO

- **메타 태그**: `app/page.tsx`에 `metadata` 추가 (Next.js 14 규칙)
- **Open Graph**: 소셜 미디어 공유 이미지 설정
- **Sitemap**: `sitemap.xml` 생성 (향후)

---

## 10. 다음 단계

### 10.1 완료 후 진행
- **UC-02**: 대시보드 페이지 (`/dashboard`) 개발
- **UC-03**: 새 분석 페이지 (`/analysis/new`) 개발

### 10.2 향후 개선 사항
- **A/B 테스트**: CTA 버튼 문구 최적화
- **애니메이션**: Framer Motion으로 Hero Section 애니메이션
- **다국어 지원**: 영어, 중국어 (Q4 2026)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-10-26
**작성자**: Product Team
**검토자**: Dev Team
**승인 상태**: Draft
