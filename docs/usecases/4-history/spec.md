# UC-004: 사주 분석 히스토리 조회

## 1. 유스케이스 개요

**유스케이스 ID**: UC-004
**유스케이스 명**: 사주 분석 히스토리 조회
**우선순위**: High
**작성일**: 2025-10-25
**최종 수정일**: 2025-10-25

### 개요 설명
사용자가 과거에 수행한 모든 사주 분석 이력을 조회하고 관리할 수 있는 기능입니다. 대시보드에서 분석 이력 목록을 확인하고, 특정 분석 결과를 다시 열람하거나 삭제할 수 있습니다.

### 비즈니스 목표
- 사용자가 과거 분석 이력을 쉽게 찾고 재확인할 수 있도록 함
- 구독 가치 증대: 분석 이력 보관을 통한 서비스 지속 사용 유도
- 사용자 데이터 관리 권한 제공 (삭제 기능)

---

## 2. 액터 (Actors)

### Primary Actor
- **로그인 사용자**: 과거 분석 이력을 조회하고 관리하려는 무료/Pro 구독자

### Secondary Actors
- **Supabase**: 분석 이력 데이터 저장 및 조회
- **Clerk**: 사용자 인증 및 세션 관리

---

## 3. 사전 조건 (Preconditions)

- [ ] 사용자가 로그인 상태여야 함 (Clerk 세션 유효)
- [ ] 사용자가 과거에 1회 이상 사주 분석을 수행한 이력이 있어야 함 (선택적)
- [ ] Supabase `analyses` 테이블에 사용자의 분석 데이터가 존재해야 함

---

## 4. 기본 플로우 (Main Flow)

### 4.1 대시보드 접속 및 이력 목록 표시

| 단계 | 사용자 액션 | 시스템 응답 |
|------|-----------|-----------|
| 1 | 사용자가 대시보드(`/dashboard`) 페이지에 접속하거나 네비게이션에서 "내 분석 이력" 메뉴를 클릭 | - Clerk 세션 검증 수행<br>- 로그인 상태 확인 |
| 2 | - | - Supabase `analyses` 테이블 조회<br>- `SELECT * FROM analyses WHERE user_id = :clerkUserId ORDER BY created_at DESC`<br>- 최신 분석순으로 정렬 |
| 3 | - | - 조회된 분석 이력을 페이지네이션 적용하여 표시 (10개/페이지)<br>- 각 분석 항목에 다음 정보 표시:<br>  • 이름<br>  • 생년월일<br>  • 분석 일시<br>  • 사용 모델 (`gemini-2.5-flash` or `gemini-2.5-pro`) |
| 4 | - | - 각 분석 카드에 액션 버튼 표시:<br>  • "상세보기" 버튼<br>  • "삭제" 아이콘 버튼 |

### 4.2 분석 상세보기

| 단계 | 사용자 액션 | 시스템 응답 |
|------|-----------|-----------|
| 5 | 사용자가 특정 분석 카드의 "상세보기" 버튼 클릭 | - `/analysis/:id` 페이지로 리다이렉트<br>- (UC-003 참조) |

### 4.3 분석 삭제

| 단계 | 사용자 액션 | 시스템 응답 |
|------|-----------|-----------|
| 6 | 사용자가 특정 분석 카드의 "삭제" 아이콘 클릭 | - 삭제 확인 모달 표시<br>- "정말 삭제하시겠습니까?" 메시지 표시<br>- "취소", "삭제" 버튼 제공 |
| 7 | 사용자가 "삭제" 버튼 클릭 | - API 요청: `DELETE /api/analysis/:id`<br>- Supabase: `DELETE FROM analyses WHERE id = :id AND user_id = :clerkUserId` 실행 |
| 8 | - | - 삭제 성공 시:<br>  • 목록에서 해당 분석 즉시 제거 (낙관적 업데이트)<br>  • "분석이 삭제되었습니다" 토스트 메시지 표시<br>  • 목록 데이터 재조회 (서버 동기화) |

### 4.4 페이지네이션

| 단계 | 사용자 액션 | 시스템 응답 |
|------|-----------|-----------|
| 9 | 사용자가 페이지 네비게이션 버튼 클릭 (다음/이전 페이지) | - Supabase 조회 시 `LIMIT 10 OFFSET :offset` 적용<br>- 해당 페이지의 분석 목록 표시<br>- 현재 페이지 번호 강조 표시 |

---

## 5. 대안 플로우 (Alternative Flows)

### 5.1 분석 이력이 없는 경우 (빈 상태)

| 단계 | 조건 | 시스템 응답 |
|------|------|-----------|
| 2A | Supabase 조회 결과가 0건인 경우 | - 빈 상태 UI 표시:<br>  • "아직 분석 이력이 없습니다" 메시지<br>  • "첫 분석을 시작해보세요" 안내 문구<br>  • "새 분석하기" 버튼 제공 (`/analysis/new`로 이동) |

### 5.2 필터링 및 정렬

| 단계 | 사용자 액션 | 시스템 응답 |
|------|-----------|-----------|
| 3A | 사용자가 정렬 옵션 선택 (예: "날짜순", "이름순") | - 클라이언트 측에서 정렬 수행<br>- 날짜순: `created_at DESC`<br>- 이름순: `name ASC` |
| 3B | 사용자가 검색 필터 입력 (예: 이름 검색) | - 클라이언트 측 필터링 수행<br>- 입력된 키워드와 이름 매칭되는 항목만 표시 |

### 5.3 삭제 취소

| 단계 | 사용자 액션 | 시스템 응답 |
|------|-----------|-----------|
| 7A | 사용자가 삭제 확인 모달에서 "취소" 버튼 클릭 | - 모달 닫기<br>- 삭제 작업 중단<br>- 목록 상태 유지 |

---

## 6. 예외 플로우 (Exception Flows)

### 6.1 로그인 세션 만료

| 단계 | 조건 | 시스템 응답 |
|------|------|-----------|
| 1E | Clerk 세션이 만료되었거나 유효하지 않은 경우 | - "세션이 만료되었습니다" 토스트 메시지 표시<br>- 로그인 페이지(`/sign-in`)로 리다이렉트<br>- 로그인 후 대시보드로 복귀 |

### 6.2 Supabase 조회 오류

| 단계 | 조건 | 시스템 응답 |
|------|------|-----------|
| 2E | Supabase DB 연결 실패 또는 조회 오류 발생 | - "데이터를 불러올 수 없습니다" 에러 메시지 표시<br>- "재시도" 버튼 제공<br>- 에러 로그 기록 (관리자 모니터링) |

### 6.3 삭제 실패

| 단계 | 조건 | 시스템 응답 |
|------|------|-----------|
| 8E | Supabase DELETE 작업 실패 (네트워크 오류, DB 오류) | - "삭제 중 오류가 발생했습니다" 토스트 메시지 표시<br>- 낙관적 업데이트 롤백 (목록에 삭제된 항목 다시 표시)<br>- "재시도" 버튼 제공 |

### 6.4 권한 없는 삭제 시도

| 단계 | 조건 | 시스템 응답 |
|------|------|-----------|
| 7E | 타인의 분석 ID로 삭제 요청 시 (`user_id`가 현재 로그인 사용자와 불일치) | - API에서 403 Forbidden 반환<br>- "접근 권한이 없습니다" 에러 메시지 표시<br>- 삭제 작업 중단 |

### 6.5 동시 삭제 요청 충돌

| 단계 | 조건 | 시스템 응답 |
|------|------|-----------|
| 7E | 사용자가 짧은 시간 내에 여러 삭제 버튼을 연속 클릭한 경우 | - 첫 번째 요청만 처리<br>- 이후 요청은 Debounce 처리로 차단<br>- "이미 삭제 중입니다" 안내 (선택적) |

---

## 7. 사후 조건 (Postconditions)

### 성공 시
- [ ] 사용자의 모든 분석 이력이 최신순으로 정렬되어 화면에 표시됨
- [ ] 사용자가 특정 분석을 상세 조회하거나 삭제할 수 있음
- [ ] 삭제된 분석은 목록에서 즉시 제거되고 Supabase DB에서도 영구 삭제됨
- [ ] 페이지네이션이 정상 작동하여 10개/페이지씩 표시됨

### 실패 시
- [ ] 에러 메시지가 사용자에게 명확히 전달됨 (예: "데이터를 불러올 수 없습니다")
- [ ] 낙관적 업데이트 실패 시 이전 상태로 롤백됨
- [ ] 에러 로그가 기록되어 관리자가 모니터링할 수 있음

---

## 8. 비기능 요구사항 (Non-Functional Requirements)

### 8.1 성능 (Performance)
- **목록 조회 응답 시간**: 500ms 이내
- **삭제 작업 완료 시간**: 1초 이내
- **페이지네이션 전환 시간**: 300ms 이내
- **동시 사용자 처리**: 최대 1,000명 동시 조회 가능

### 8.2 보안 (Security)
- Clerk JWT 토큰 검증을 통한 인증 확인
- Supabase RLS (Row Level Security) 적용: `user_id = auth.uid()` 조건으로 타인의 데이터 접근 차단
- API 엔드포인트에서 사용자 소유권 검증 필수

### 8.3 사용성 (Usability)
- 빈 상태 UI 제공: 분석 이력이 없을 때 명확한 안내 및 행동 유도 (CTA)
- 삭제 확인 모달: 실수로 삭제하는 것을 방지
- 토스트 메시지: 성공/실패 상태를 사용자에게 명확히 전달

### 8.4 확장성 (Scalability)
- 페이지네이션 적용으로 대량의 분석 이력(100건 이상)도 원활히 표시
- 무한 스크롤 옵션 검토 (향후 개선)

---

## 9. 데이터 요구사항

### 9.1 입력 데이터
- **사용자 인증 토큰**: Clerk JWT (세션 쿠키)
- **페이지네이션 파라미터**: `page`, `limit` (기본값: `page=1`, `limit=10`)
- **정렬 옵션**: `sort` (기본값: `created_at DESC`)
- **삭제 요청 시**: `analysisId` (UUID)

### 9.2 출력 데이터
- **분석 목록**:
  - `id` (UUID): 분석 고유 ID
  - `name` (string): 분석 대상 이름
  - `birth_date` (date): 생년월일
  - `created_at` (timestamp): 분석 일시
  - `model_used` (string): 사용 모델 (`gemini-2.5-flash` or `gemini-2.5-pro`)

### 9.3 데이터 검증 규칙
- `user_id` 필드는 현재 로그인 사용자의 Clerk User ID와 일치해야 함
- `analysisId`는 유효한 UUID 형식이어야 함
- 페이지네이션 파라미터는 양수여야 함 (`page >= 1`, `limit >= 1`)

---

## 10. UI/UX 요구사항

### 10.1 대시보드 레이아웃
- **헤더**:
  - "내 분석 이력" 제목
  - "새 분석하기" 버튼 (우측 상단)
- **필터/정렬 영역**:
  - 정렬 드롭다운: "최신순", "이름순"
  - 검색 입력 필드 (선택적)
- **분석 목록**:
  - 카드 형태로 표시 (반응형: 모바일 1열, 태블릿 2열, 데스크톱 3열)
  - 각 카드 내용:
    - 이름 (굵게)
    - 생년월일 (YYYY-MM-DD 형식)
    - 분석 일시 (YYYY-MM-DD HH:MM 형식)
    - 사용 모델 (뱃지 형태: "Flash" or "Pro")
  - 액션 버튼:
    - "상세보기" 버튼 (기본 스타일)
    - "삭제" 아이콘 버튼 (휴지통 아이콘, 위험 색상)
- **페이지네이션**:
  - 하단 중앙 정렬
  - 이전/다음 버튼 + 페이지 번호 표시
  - 현재 페이지 강조 표시

### 10.2 빈 상태 UI
- 중앙 정렬
- 아이콘: 문서 또는 역사 관련 아이콘
- 메시지: "아직 분석 이력이 없습니다"
- 보조 메시지: "첫 분석을 시작해보세요!"
- CTA 버튼: "새 분석하기" (기본 스타일, `/analysis/new`로 이동)

### 10.3 삭제 확인 모달
- 제목: "분석 삭제"
- 내용: "정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
- 버튼:
  - "취소" (보조 스타일)
  - "삭제" (위험 색상)

### 10.4 로딩 및 에러 상태
- **로딩 중**: Skeleton UI 표시 (카드 형태 유지)
- **에러 발생**: 에러 메시지 + "재시도" 버튼

---

## 11. 인수 기준 (Acceptance Criteria)

### AC-1: 분석 이력 목록 조회
```gherkin
Given 사용자가 로그인 상태이고
And 과거에 2회 이상 사주 분석을 수행한 이력이 있을 때
When 사용자가 대시보드(`/dashboard`)에 접속하면
Then 사용자의 모든 분석 이력이 최신순으로 표시되어야 함
And 각 분석 항목에 "이름", "생년월일", "분석 일시", "사용 모델" 정보가 표시되어야 함
And "상세보기", "삭제" 버튼이 각 항목에 표시되어야 함
```

### AC-2: 빈 상태 UI 표시
```gherkin
Given 사용자가 로그인 상태이고
And 과거 사주 분석 이력이 0건일 때
When 사용자가 대시보드에 접속하면
Then "아직 분석 이력이 없습니다" 메시지가 표시되어야 함
And "새 분석하기" 버튼이 표시되어야 함
And 버튼 클릭 시 `/analysis/new` 페이지로 이동해야 함
```

### AC-3: 분석 상세보기
```gherkin
Given 사용자가 대시보드에서 분석 목록을 확인하고 있을 때
When 특정 분석 카드의 "상세보기" 버튼을 클릭하면
Then `/analysis/:id` 페이지로 리다이렉트되어야 함
And 해당 분석의 상세 내용이 표시되어야 함
```

### AC-4: 분석 삭제
```gherkin
Given 사용자가 대시보드에서 분석 목록을 확인하고 있을 때
When 특정 분석 카드의 "삭제" 버튼을 클릭하면
Then 삭제 확인 모달이 표시되어야 함
And 모달에서 "삭제" 버튼을 클릭하면
Then 해당 분석이 목록에서 즉시 제거되어야 함
And "분석이 삭제되었습니다" 토스트 메시지가 표시되어야 함
And Supabase `analyses` 테이블에서 해당 레코드가 삭제되어야 함
```

### AC-5: 삭제 취소
```gherkin
Given 사용자가 삭제 확인 모달을 보고 있을 때
When "취소" 버튼을 클릭하면
Then 모달이 닫혀야 함
And 삭제 작업이 중단되어야 함
And 목록 상태가 변경되지 않아야 함
```

### AC-6: 페이지네이션
```gherkin
Given 사용자가 15건의 분석 이력을 보유하고 있을 때
When 대시보드에 접속하면
Then 첫 페이지에 10건의 분석만 표시되어야 함
And 페이지 네비게이션에 "1", "2" 버튼이 표시되어야 함
When "2" 버튼을 클릭하면
Then 나머지 5건의 분석이 표시되어야 함
```

### AC-7: 정렬 기능
```gherkin
Given 사용자가 대시보드에서 분석 목록을 확인하고 있을 때
When 정렬 옵션을 "이름순"으로 변경하면
Then 분석 목록이 이름 기준 오름차순으로 재정렬되어야 함
```

### AC-8: 에러 핸들링
```gherkin
Given 사용자가 대시보드에 접속하려 할 때
And Supabase DB 연결이 실패한 경우
Then "데이터를 불러올 수 없습니다" 에러 메시지가 표시되어야 함
And "재시도" 버튼이 제공되어야 함
When "재시도" 버튼을 클릭하면
Then 데이터 조회 요청이 재시도되어야 함
```

### AC-9: 권한 검증
```gherkin
Given 사용자 A가 로그인 상태일 때
When 사용자 B의 분석 ID로 삭제 요청을 시도하면
Then API에서 403 Forbidden 응답을 반환해야 함
And "접근 권한이 없습니다" 에러 메시지가 표시되어야 함
And 삭제 작업이 실행되지 않아야 함
```

### AC-10: 성능 요구사항
```gherkin
Given 사용자가 50건의 분석 이력을 보유하고 있을 때
When 대시보드에 접속하면
Then 페이지 로딩 시간이 500ms 이내여야 함
And 페이지네이션 전환 시간이 300ms 이내여야 함
```

---

## 12. 기술 구현 가이드

### 12.1 API 엔드포인트

#### GET `/api/analysis/list`
**설명**: 사용자의 분석 이력 목록 조회

**요청 헤더**:
```http
Authorization: Bearer {CLERK_JWT_TOKEN}
```

**쿼리 파라미터**:
```typescript
{
  page?: number; // 기본값: 1
  limit?: number; // 기본값: 10
  sort?: 'created_at' | 'name'; // 기본값: 'created_at'
  order?: 'asc' | 'desc'; // 기본값: 'desc'
}
```

**응답 (200 OK)**:
```typescript
{
  success: true;
  data: {
    analyses: [
      {
        id: string; // UUID
        name: string;
        birth_date: string; // YYYY-MM-DD
        birth_time: string | null;
        gender: 'male' | 'female';
        model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
        created_at: string; // ISO 8601
      }
    ];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

**응답 (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**응답 (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Database query failed"
}
```

---

#### DELETE `/api/analysis/:id`
**설명**: 특정 분석 이력 삭제

**요청 헤더**:
```http
Authorization: Bearer {CLERK_JWT_TOKEN}
```

**경로 파라미터**:
```typescript
{
  id: string; // UUID
}
```

**응답 (200 OK)**:
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

**응답 (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Access denied: This analysis does not belong to you"
}
```

**응답 (404 Not Found)**:
```json
{
  "success": false,
  "error": "Analysis not found"
}
```

**응답 (500 Internal Server Error)**:
```json
{
  "success": false,
  "error": "Failed to delete analysis"
}
```

---

### 12.2 Supabase 쿼리 예시

#### 목록 조회 쿼리
```typescript
const { data, error, count } = await supabase
  .from('analyses')
  .select('id, name, birth_date, birth_time, gender, model_used, created_at', { count: 'exact' })
  .eq('user_id', clerkUserId)
  .order('created_at', { ascending: false })
  .range((page - 1) * limit, page * limit - 1);
```

#### 삭제 쿼리
```typescript
const { error } = await supabase
  .from('analyses')
  .delete()
  .eq('id', analysisId)
  .eq('user_id', clerkUserId); // 권한 검증 필수
```

---

### 12.3 프론트엔드 컴포넌트 구조

```typescript
// app/dashboard/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { AnalysisCard } from '@/components/AnalysisCard';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';

export default function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const [analyses, setAnalyses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchAnalyses(currentPage);
    }
  }, [isSignedIn, currentPage]);

  const fetchAnalyses = async (page: number) => {
    setIsLoading(true);
    const res = await fetch(`/api/analysis/list?page=${page}&limit=10`);
    const data = await res.json();
    setAnalyses(data.data.analyses);
    setTotalPages(data.data.pagination.totalPages);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    // 낙관적 업데이트
    setAnalyses(prev => prev.filter(a => a.id !== id));

    try {
      const res = await fetch(`/api/analysis/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('분석이 삭제되었습니다');
    } catch (error) {
      // 롤백
      fetchAnalyses(currentPage);
      toast.error('삭제 중 오류가 발생했습니다');
    }
  };

  if (isLoading) return <SkeletonLoader />;
  if (analyses.length === 0) return <EmptyState />;

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 분석 이력</h1>
        <button onClick={() => router.push('/analysis/new')}>
          새 분석하기
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map(analysis => (
          <AnalysisCard
            key={analysis.id}
            analysis={analysis}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

---

## 13. 테스트 시나리오

### 13.1 단위 테스트 (Unit Test)
- [ ] API 엔드포인트 `/api/analysis/list`가 올바른 페이지네이션 데이터를 반환하는지 검증
- [ ] API 엔드포인트 `/api/analysis/:id` DELETE가 권한 검증을 수행하는지 검증
- [ ] Supabase 쿼리가 올바른 SQL을 생성하는지 검증

### 13.2 통합 테스트 (Integration Test)
- [ ] 로그인 사용자가 대시보드에 접속 시 분석 목록이 정상 표시되는지 확인
- [ ] 삭제 버튼 클릭 → 확인 모달 → 삭제 완료까지 전체 플로우 검증
- [ ] 페이지네이션 버튼 클릭 시 다음/이전 페이지로 정상 이동하는지 확인

### 13.3 E2E 테스트 (End-to-End Test)
- [ ] 사용자가 로그인 → 대시보드 접속 → 분석 이력 확인 → 상세보기 클릭까지 전체 플로우 검증
- [ ] 사용자가 로그인 → 대시보드 접속 → 분석 삭제 → 목록 새로고침까지 전체 플로우 검증
- [ ] 분석 이력이 없는 사용자가 대시보드 접속 시 빈 상태 UI가 표시되는지 확인

---

## 14. 참고 자료

- **관련 유스케이스**:
  - UC-003: 사주 분석 결과 조회 (상세보기 플로우)
  - UC-002: 사주 분석 요청 (새 분석하기 플로우)
- **기술 문서**:
  - Clerk Authentication: https://clerk.com/docs
  - Supabase Database: https://supabase.com/docs/guides/database
  - Next.js App Router: https://nextjs.org/docs/app
- **요구사항 문서**: `/docs/requirement.md` (섹션 10: 데이터베이스 스키마)
- **사용자 플로우**: `/docs/userflow.md` (섹션 5: 히스토리/저장된 사주 조회 플로우)

---

## 15. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2025-10-25 | AI Assistant | 초안 작성 |

---

**문서 종료**
