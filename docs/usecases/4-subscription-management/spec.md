# UC-04: 구독 취소 및 재활성화

**유스케이스 ID**: UC-04
**유스케이스명**: Pro 구독 취소 및 재활성화
**작성일**: 2025-10-26
**버전**: 1.0
**우선순위**: P0 (필수)

---

## 1. 개요

### 1.1 목적
Pro 구독 사용자가 구독을 자유롭게 취소하고, 취소 후에도 결제일 전까지는 다시 재활성화할 수 있는 유연한 구독 관리 기능을 제공합니다.

### 1.2 범위
- 구독 취소 요청 처리
- 구독 재활성화 처리
- 구독 상태별 UI/UX 제공
- 결제일 기반 자동 해지 처리

### 1.3 관련 문서
- **Userflow**: `/docs/userflow.md` - UF-04 섹션
- **PRD**: `/docs/prd.md` - 구독 정책
- **Database**: `/docs/database.md` - subscriptions 테이블

---

## 2. 액터 (Actors)

### 2.1 주요 액터
- **Pro 구독자**: 구독을 취소하거나 재활성화하는 사용자

### 2.2 시스템 액터
- **Supabase**: 구독 상태 저장 및 조회
- **Toss Payments**: BillingKey 관리 (해지 시에만 사용)
- **Supabase Cron**: 결제일 도래 시 자동 해지 처리

---

## 3. 사전 조건 (Preconditions)

### 3.1 구독 취소
- 사용자가 로그인 상태여야 함
- 현재 구독 상태가 `status = 'active'`이고 `plan_type = 'pro'`여야 함
- BillingKey가 유효하게 저장되어 있어야 함

### 3.2 구독 재활성화
- 사용자가 로그인 상태여야 함
- 현재 구독 상태가 `status = 'cancelled'`여야 함
- `next_payment_date > 현재 날짜`여야 함 (결제일 전까지만 재활성화 가능)

---

## 4. 사후 조건 (Postconditions)

### 4.1 구독 취소 성공 시
- `subscriptions.status`가 `'cancelled'`로 변경됨
- `subscriptions.cancelled_at`에 취소 요청 시각이 기록됨
- BillingKey는 유지됨 (재활성화 가능)
- 다음 결제일까지 Pro 혜택 유지

### 4.2 구독 재활성화 성공 시
- `subscriptions.status`가 `'active'`로 변경됨
- `subscriptions.cancelled_at`가 `NULL`로 초기화됨
- 다음 결제일에 정기 결제 재개

---

## 5. 주요 플로우 (Main Flow)

### 5.1 구독 취소 플로우

#### 단계별 시나리오

**Step 1: 구독 관리 페이지 접속**
- **액터**: Pro 구독자
- **액션**: `/subscription` 페이지 접속
- **시스템 응답**:
  ```sql
  SELECT
    plan_type,
    status,
    next_payment_date,
    quota,
    billing_key
  FROM subscriptions
  WHERE clerk_user_id = :userId;
  ```
- **화면 표시**:
  - 현재 플랜: "Pro 구독 중"
  - 다음 결제일: "2025-11-26"
  - 결제 금액: "9,900원"
  - 결제 수단: "**** **** **** 1234"
  - "구독 취소" 버튼

**Step 2: 취소 확인 모달 표시**
- **액터**: Pro 구독자
- **액션**: "구독 취소" 버튼 클릭
- **시스템 응답**: 확인 모달 표시
- **모달 내용**:
  ```
  제목: 구독을 취소하시겠습니까?

  본문:
  - 다음 결제일(2025-11-26)까지 Pro 혜택이 유지됩니다.
  - 결제일 전까지는 언제든 취소를 철회할 수 있습니다.
  - 결제일 이후에는 자동으로 해지되며, BillingKey가 삭제됩니다.

  버튼: [취소] [확인]
  ```

**Step 3: 취소 요청 처리**
- **액터**: Pro 구독자
- **액션**: 확인 모달에서 "확인" 클릭
- **API 호출**: `POST /api/subscription/cancel`
- **시스템 처리**:
  ```sql
  UPDATE subscriptions
  SET
    status = 'cancelled',
    cancelled_at = NOW()
  WHERE clerk_user_id = :userId
    AND status = 'active'
    AND plan_type = 'pro';
  ```
- **검증**:
  - 업데이트된 행 수 확인 (0이면 이미 취소됨 또는 권한 없음)
  - BillingKey는 유지 (재활성화 대비)

**Step 4: 취소 완료 안내**
- **시스템 응답**:
  - HTTP 200 OK
  - 응답 바디:
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
- **화면 업데이트**:
  - Toast 알림: "구독이 취소되었습니다. 2025-11-26까지 이용 가능합니다."
  - "구독 취소" 버튼 → "취소 철회" 버튼으로 변경
  - 안내 문구 추가: "⚠️ 구독이 취소 예정입니다. 2025-11-26에 자동 해지됩니다."

---

### 5.2 구독 재활성화 플로우

#### 단계별 시나리오

**Step 1: 취소 상태 확인**
- **액터**: Pro 구독자 (취소 상태)
- **액션**: `/subscription` 페이지 재접속
- **시스템 응답**:
  ```sql
  SELECT
    status,
    cancelled_at,
    next_payment_date
  FROM subscriptions
  WHERE clerk_user_id = :userId;
  ```
- **화면 표시**:
  - 구독 상태: "취소 예정 (2025-11-26 해지)"
  - "취소 철회" 버튼 표시
  - 안내 문구: "결제일 전까지 취소를 철회할 수 있습니다."

**Step 2: 재활성화 확인 모달**
- **액터**: Pro 구독자
- **액션**: "취소 철회" 버튼 클릭
- **시스템 응답**: 확인 모달 표시
- **모달 내용**:
  ```
  제목: 구독을 재활성화하시겠습니까?

  본문:
  - 다음 결제일(2025-11-26)에 정기 결제가 재개됩니다.
  - 결제 금액: 9,900원
  - 결제 수단: **** **** **** 1234

  버튼: [취소] [확인]
  ```

**Step 3: 재활성화 요청 처리**
- **액터**: Pro 구독자
- **액션**: 확인 모달에서 "확인" 클릭
- **API 호출**: `POST /api/subscription/reactivate`
- **시스템 처리**:
  ```sql
  UPDATE subscriptions
  SET
    status = 'active',
    cancelled_at = NULL
  WHERE clerk_user_id = :userId
    AND status = 'cancelled'
    AND next_payment_date > CURRENT_DATE;
  ```
- **검증**:
  - 업데이트된 행 수 확인
  - `next_payment_date > 현재 날짜` 검증 (결제일 이후면 실패)

**Step 4: 재활성화 완료 안내**
- **시스템 응답**:
  - HTTP 200 OK
  - 응답 바디:
    ```json
    {
      "success": true,
      "message": "구독이 재활성화되었습니다.",
      "data": {
        "status": "active",
        "nextPaymentDate": "2025-11-26"
      }
    }
    ```
- **화면 업데이트**:
  - Toast 알림: "구독이 재활성화되었습니다. 다음 결제일: 2025-11-26"
  - "취소 철회" 버튼 → "구독 취소" 버튼으로 변경
  - 안내 문구: "✅ Pro 구독이 활성 상태입니다."

---

## 6. 대체 플로우 (Alternative Flows)

### 6.1 이미 취소된 구독 재취소 시도

**트리거**: 사용자가 `status = 'cancelled'` 상태에서 취소 버튼 클릭

**처리**:
1. API 검증:
   ```typescript
   if (currentStatus !== 'active') {
     return { error: '이미 취소된 구독입니다.', code: 400 };
   }
   ```
2. 프론트엔드 방어:
   - `status === 'cancelled'`일 때 "구독 취소" 버튼 비활성화
   - "취소 철회" 버튼만 표시

---

### 6.2 결제일 이후 재활성화 시도

**트리거**: `next_payment_date`가 지난 후 재활성화 시도

**처리**:
1. SQL 조건 실패:
   ```sql
   -- WHERE 절에서 필터링됨
   WHERE next_payment_date > CURRENT_DATE
   ```
2. API 응답:
   ```json
   {
     "success": false,
     "error": "구독 기간이 만료되어 재활성화할 수 없습니다.",
     "code": 400
   }
   ```
3. 화면 표시:
   - Toast 에러: "구독 기간이 만료되었습니다. 새로 구독해주세요."
   - "취소 철회" 버튼 → "Pro 구독 시작" 버튼으로 변경

---

### 6.3 무료 사용자 취소 시도

**트리거**: `plan_type = 'free'` 사용자가 취소 시도

**처리**:
1. API 검증:
   ```typescript
   if (planType !== 'pro') {
     return { error: '구독 중인 플랜이 없습니다.', code: 400 };
   }
   ```
2. 프론트엔드 방어:
   - 무료 사용자에게는 "구독 취소" 버튼 비표시
   - 대신 "Pro 구독 시작" 버튼만 표시

---

### 6.4 해지된 구독 재활성화 시도

**트리거**: `status = 'terminated'` 구독 재활성화 시도

**처리**:
1. API 응답:
   ```json
   {
     "success": false,
     "error": "해지된 구독은 재활성화할 수 없습니다. 새로 구독해주세요.",
     "code": 400
   }
   ```
2. 화면 안내:
   - "취소 철회" 버튼 숨김
   - "새로 구독하기" CTA 표시
   - 설명: "이전 구독이 해지되었습니다. 새로 구독하시면 BillingKey가 재발급됩니다."

---

## 7. 예외 플로우 (Exception Flows)

### 7.1 네트워크 오류

**상황**: API 호출 중 네트워크 연결 끊김

**처리**:
- 프론트엔드:
  ```typescript
  try {
    await fetch('/api/subscription/cancel', { method: 'POST' });
  } catch (error) {
    toast.error('인터넷 연결을 확인해주세요.');
    setIsLoading(false);
  }
  ```
- 재시도 로직:
  - 자동 재시도 없음 (사용자 의도 불명확)
  - "다시 시도" 버튼 제공

---

### 7.2 데이터베이스 장애

**상황**: Supabase 응답 없음 (타임아웃)

**처리**:
1. API 타임아웃 설정: 5초
2. 응답:
   ```json
   {
     "success": false,
     "error": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
     "code": 500
   }
   ```
3. 모니터링:
   - Sentry 에러 로깅
   - Slack 긴급 알림 발송

---

### 7.3 동시 요청 (Race Condition)

**상황**: 사용자가 "구독 취소" 버튼 중복 클릭

**처리**:
1. 프론트엔드 방어:
   ```typescript
   const [isLoading, setIsLoading] = useState(false);

   async function handleCancel() {
     if (isLoading) return; // 중복 클릭 차단
     setIsLoading(true);
     await cancelSubscription();
     setIsLoading(false);
   }
   ```
2. 버튼 비활성화:
   ```tsx
   <Button disabled={isLoading}>
     {isLoading ? '처리 중...' : '구독 취소'}
   </Button>
   ```

---

## 8. 비기능 요구사항 (Non-Functional Requirements)

### 8.1 성능
- **응답 시간**: API 응답 시간 1초 이내 (95th percentile)
- **동시성**: 동시 100명 요청 처리 가능 (데이터베이스 트랜잭션)

### 8.2 보안
- **인증**: Clerk 세션 검증 필수
- **권한**: 본인의 구독만 취소/재활성화 가능
  ```typescript
  // 미들웨어 검증
  const { userId } = auth();
  const subscription = await getSubscription(userId);

  if (subscription.clerk_user_id !== userId) {
    return new Response('Forbidden', { status: 403 });
  }
  ```

### 8.3 사용성
- **명확한 안내**: 취소 시 결제일까지 유지된다는 점 명시
- **되돌리기 가능**: 결제일 전까지 재활성화 가능
- **시각적 피드백**: 로딩 스피너, Toast 알림

### 8.4 신뢰성
- **트랜잭션 보장**: 구독 상태 변경은 원자적으로 처리
- **멱등성**: 동일 요청 중복 실행 시 안전
  ```sql
  -- 이미 취소된 구독 재취소 시 영향 없음
  UPDATE subscriptions SET status = 'cancelled'
  WHERE status = 'active'; -- 조건 실패 시 0건 업데이트
  ```

---

## 9. 데이터 요구사항 (Data Requirements)

### 9.1 입력 데이터

#### 구독 취소 API
```typescript
// POST /api/subscription/cancel
// Request Body: 없음 (userId는 세션에서 추출)

// Headers:
{
  "Authorization": "Bearer <clerk-session-token>"
}
```

#### 구독 재활성화 API
```typescript
// POST /api/subscription/reactivate
// Request Body: 없음

// Headers:
{
  "Authorization": "Bearer <clerk-session-token>"
}
```

---

### 9.2 출력 데이터

#### 성공 응답 (취소)
```json
{
  "success": true,
  "message": "구독이 취소되었습니다. 2025-11-26까지 Pro 혜택이 유지됩니다.",
  "data": {
    "status": "cancelled",
    "cancelledAt": "2025-10-26T15:30:00Z",
    "nextPaymentDate": "2025-11-26",
    "quotaRemaining": 8
  }
}
```

#### 성공 응답 (재활성화)
```json
{
  "success": true,
  "message": "구독이 재활성화되었습니다.",
  "data": {
    "status": "active",
    "cancelledAt": null,
    "nextPaymentDate": "2025-11-26",
    "quotaRemaining": 8
  }
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": "이미 취소된 구독입니다.",
  "code": 400
}
```

---

### 9.3 데이터베이스 변경

#### 취소 시
```sql
-- Before
status: 'active'
cancelled_at: NULL

-- After
status: 'cancelled'
cancelled_at: '2025-10-26 15:30:00'
```

#### 재활성화 시
```sql
-- Before
status: 'cancelled'
cancelled_at: '2025-10-26 15:30:00'

-- After
status: 'active'
cancelled_at: NULL
```

---

## 10. UI/UX 요구사항

### 10.1 구독 관리 페이지 (`/subscription`)

#### 활성 상태 (status = 'active')
```
┌─────────────────────────────────────┐
│ 💳 Pro 구독 중                       │
├─────────────────────────────────────┤
│ 다음 결제일: 2025-11-26              │
│ 결제 금액: 9,900원                   │
│ 결제 수단: **** **** **** 1234       │
│                                     │
│ [구독 취소]                          │
└─────────────────────────────────────┘
```

#### 취소 예정 상태 (status = 'cancelled')
```
┌─────────────────────────────────────┐
│ ⚠️ 구독 취소 예정                    │
├─────────────────────────────────────┤
│ 해지일: 2025-11-26                   │
│ 안내: 해지일까지 Pro 혜택이 유지됩니다 │
│                                     │
│ [취소 철회]                          │
└─────────────────────────────────────┘
```

---

### 10.2 확인 모달

#### 취소 확인 모달
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

## 11. 시스템 통합 요구사항

### 11.1 Supabase Cron 연동

**트리거**: 매일 02:00 KST (UTC 17:00 전날)

**처리 로직**:
```typescript
// /api/cron/process-billing
async function handleCancelledSubscriptions() {
  // 결제일 도래한 취소 예정 구독 조회
  const { data: cancelledSubs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'cancelled')
    .eq('next_payment_date', today);

  for (const sub of cancelledSubs) {
    // 자동 해지 처리
    await supabase
      .from('subscriptions')
      .update({
        status: 'terminated',
        quota: 0,
        billing_key: null,
      })
      .eq('clerk_user_id', sub.clerk_user_id);

    // Toss BillingKey 삭제
    await toss.deleteBillingKey(sub.billing_key);

    // 사용자 알림 (선택)
    await sendEmail({
      to: sub.email,
      subject: '구독이 해지되었습니다',
      body: '결제일 도래로 인해 구독이 자동 해지되었습니다.',
    });
  }
}
```

---

### 11.2 Toss Payments 연동

**BillingKey 삭제 API**:
```typescript
// 해지 시에만 호출
async function deleteBillingKey(billingKey: string) {
  await fetch(
    `https://api.tosspayments.com/v1/billing/${billingKey}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
      },
    }
  );
}
```

**호출 시점**:
- ❌ 구독 취소 시: 호출하지 않음 (재활성화 대비)
- ❌ 구독 재활성화 시: 호출하지 않음
- ✅ 구독 해지 시: 호출함 (Cron에서 처리)

---

## 12. 테스트 시나리오

### 12.1 단위 테스트

#### TC-01: 구독 취소 성공
- **Given**: Pro 활성 구독자 (status='active')
- **When**: `/api/subscription/cancel` POST 요청
- **Then**:
  - 응답 200 OK
  - `status`가 'cancelled'로 변경
  - `cancelled_at`에 현재 시각 기록
  - BillingKey 유지

#### TC-02: 구독 재활성화 성공
- **Given**: 취소 예정 구독 (status='cancelled', next_payment_date > 오늘)
- **When**: `/api/subscription/reactivate` POST 요청
- **Then**:
  - 응답 200 OK
  - `status`가 'active'로 변경
  - `cancelled_at`이 NULL로 초기화

#### TC-03: 결제일 이후 재활성화 실패
- **Given**: 취소 예정 구독 (next_payment_date < 오늘)
- **When**: `/api/subscription/reactivate` POST 요청
- **Then**:
  - 응답 400 Bad Request
  - 에러 메시지: "구독 기간이 만료되어 재활성화할 수 없습니다."

---

### 12.2 통합 테스트

#### IT-01: 취소 → 재활성화 → 정기결제
1. Pro 구독 취소
2. 상태 확인: `status = 'cancelled'`
3. 재활성화
4. 상태 확인: `status = 'active'`
5. Cron 실행 (결제일 도래)
6. 결제 성공 확인
7. 쿼터 리셋 확인 (quota = 10)

#### IT-02: 취소 → 결제일 도래 → 자동 해지
1. Pro 구독 취소
2. 날짜를 `next_payment_date`로 변경 (시뮬레이션)
3. Cron 실행
4. 상태 확인: `status = 'terminated'`
5. BillingKey 확인: `billing_key = NULL`
6. 토스 API BillingKey 삭제 확인

---

### 12.3 E2E 테스트

#### E2E-01: 전체 사용자 플로우
1. 브라우저에서 로그인
2. `/subscription` 접속
3. "구독 취소" 버튼 클릭
4. 확인 모달 확인
5. "확인" 버튼 클릭
6. Toast 알림 확인: "구독이 취소되었습니다..."
7. "취소 철회" 버튼 표시 확인
8. "취소 철회" 버튼 클릭
9. 확인 모달 확인
10. "확인" 버튼 클릭
11. Toast 알림 확인: "구독이 재활성화되었습니다."
12. "구독 취소" 버튼 표시 확인

---

## 13. 모니터링 및 로깅

### 13.1 로그 기록

#### 구독 취소 로그
```typescript
logger.info('Subscription cancelled', {
  userId: userId,
  previousStatus: 'active',
  newStatus: 'cancelled',
  cancelledAt: new Date().toISOString(),
  nextPaymentDate: nextPaymentDate,
});
```

#### 구독 재활성화 로그
```typescript
logger.info('Subscription reactivated', {
  userId: userId,
  previousStatus: 'cancelled',
  newStatus: 'active',
  cancelledDuration: Date.now() - cancelledAt, // 취소 기간 (ms)
});
```

---

### 13.2 지표 수집

| 지표 | 설명 | 목표 |
|------|------|------|
| **취소율 (Churn Rate)** | 월간 취소 구독 수 / 전체 Pro 구독 수 | < 20% |
| **재활성화율 (Reactivation Rate)** | 재활성화 수 / 취소 수 | > 30% |
| **평균 취소 기간** | 취소 ~ 해지 사이 평균 일수 | 추적 (개선 인사이트) |

---

## 14. 개선 제안 (향후 고려사항)

### 14.1 취소 사유 조사
- 취소 시 사유 선택 옵션 추가 (설문)
  - 가격 부담
  - 사용 빈도 낮음
  - 기능 불만족
  - 기타
- 목적: 서비스 개선 인사이트 수집

### 14.2 할인 쿠폰 제안
- 취소 시도 시 "다음 달 50% 할인" 쿠폰 제안
- 목적: Retention 향상

### 14.3 이메일 알림 강화
- 결제일 7일 전 리마인더: "곧 구독이 해지됩니다. 재활성화하시겠습니까?"
- 목적: 실수로 취소한 사용자 복귀 유도

---

## 15. 용어 정리

| 용어 | 정의 |
|------|------|
| **구독 취소 (Cancel)** | 사용자 요청으로 `status = 'cancelled'`로 변경, BillingKey 유지 |
| **구독 재활성화 (Reactivate)** | 취소 상태에서 `status = 'active'`로 복원 |
| **구독 해지 (Terminate)** | 결제일 도래 또는 결제 실패로 BillingKey 삭제, `status = 'terminated'` |
| **결제일 (Next Payment Date)** | 다음 정기 결제 예정일 |
| **BillingKey** | 토스페이먼츠 정기결제용 카드 인증 키 |

---

## 16. 참고 자료

- **Userflow**: `/docs/userflow.md` - UF-04 상세 플로우
- **Database**: `/docs/database.md` - subscriptions 테이블 스키마
- **PRD**: `/docs/prd.md` - 구독 정책 요구사항
- **Toss Payments API**: [정기결제 가이드](https://docs.tosspayments.com/guides/billing)

---

**작성일**: 2025-10-26
**작성자**: Product Team
**승인 상태**: Draft
**다음 리뷰**: 구현 전 검토 필요
