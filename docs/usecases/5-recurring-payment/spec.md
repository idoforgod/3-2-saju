# UC-05: 정기 결제 자동화 (Cron)

**버전**: 1.0
**작성일**: 2025-10-26
**상태**: Draft

---

## 개요

### 목적
매일 정해진 시간(02:00 KST)에 결제일이 도래한 Pro 구독자들의 정기 결제를 자동으로 처리하여, 수동 개입 없이 구독 서비스가 연속적으로 제공되도록 한다.

### 범위
- **포함**: 정기 결제 대상 조회, BillingKey 기반 자동 결제, 결제 성공/실패 처리, 구독 상태 업데이트
- **제외**: 수동 결제 재시도, 결제 실패 알림 이메일 발송 (향후 구현)

---

## Primary Actor
- **시스템 (Supabase Cron)**

---

## Precondition
- Supabase Cron이 정상적으로 설정되어 매일 02:00 KST (UTC 17:00 전날)에 실행됨
- `CRON_SECRET_TOKEN` 환경 변수가 설정되어 있음
- 결제일(`next_payment_date`)이 오늘인 활성 Pro 구독 레코드가 존재함
- Toss Payments API가 정상 작동 중임

---

## Trigger
- **자동 트리거**: Supabase Cron이 매일 02:00 KST에 `/api/cron/process-billing` API를 호출

---

## Main Scenario

### 1. Cron 작업 시작
**Actor**: Supabase Cron
**Action**: 매일 02:00 KST에 HTTP POST 요청 발송
**Input**:
- URL: `https://yourdomain.vercel.app/api/cron/process-billing`
- Headers: `Authorization: Bearer {CRON_SECRET_TOKEN}`
- Body: `{trigger: 'cron'}`

### 2. 인증 검증
**Actor**: API (`/api/cron/process-billing`)
**Action**: 요청 헤더의 Bearer Token 검증
**Processing**:
```typescript
const authHeader = req.headers.get('authorization');
const token = authHeader?.replace('Bearer ', '');

if (token !== process.env.CRON_SECRET_TOKEN) {
  return new Response('Unauthorized', { status: 401 });
}
```
**Output**:
- 성공 시: 다음 단계 진행
- 실패 시: 401 Unauthorized 응답, 처리 중단

### 3. 결제 대상 구독 조회
**Actor**: API
**Action**: 오늘이 결제일인 활성 Pro 구독 조회
**Query**:
```sql
SELECT
  clerk_user_id,
  billing_key,
  next_payment_date
FROM subscriptions
WHERE next_payment_date = CURRENT_DATE
  AND status = 'active'
  AND plan_type = 'pro';
```
**Output**: 결제 대상 구독 목록 (0건 이상)

### 4. 각 구독별 결제 처리 (Loop)
**For Each** 구독 레코드:

#### 4.1 Toss Payments API 호출
**Actor**: API
**Action**: BillingKey를 사용한 정기 결제 실행
**API Call**:
```typescript
POST https://api.tosspayments.com/v1/billing/{billingKey}
Headers:
  Authorization: Basic {Base64(TOSS_SECRET_KEY + ':')}
  Content-Type: application/json
Body:
  {
    customerKey: clerk_user_id,
    amount: 9900,
    orderId: `order_${clerk_user_id}_${timestamp}`,
    orderName: "사주분석 Pro 구독",
    customerEmail: user_email
  }
```

#### 4.2 결제 결과 처리

##### 4.2.1 결제 성공 (status: 'DONE')
**Action**: 구독 정보 업데이트
**Database Update**:
```sql
UPDATE subscriptions
SET
  quota = 10,
  next_payment_date = CURRENT_DATE + INTERVAL '1 month',
  last_payment_date = CURRENT_DATE
WHERE clerk_user_id = ?;
```
**Result**:
- 쿼터 10회로 리셋
- 다음 결제일이 1개월 후로 연장
- Pro 구독 계속 유지

##### 4.2.2 결제 실패 (status: 'FAILED' 또는 Exception)
**Action**: 구독 해지 및 BillingKey 삭제

**Step 1**: Toss Payments에서 BillingKey 삭제
```typescript
DELETE https://api.tosspayments.com/v1/billing/{billingKey}
```

**Step 2**: Supabase 구독 정보 업데이트
```sql
UPDATE subscriptions
SET
  status = 'terminated',
  quota = 0,
  billing_key = NULL
WHERE clerk_user_id = ?;
```

**Result**:
- 구독 상태가 'terminated'로 변경
- 쿼터 0으로 초기화
- BillingKey 삭제되어 향후 결제 불가
- 사용자가 재구독 필요

### 5. 배치 작업 완료
**Actor**: API
**Action**: 모든 구독 처리 완료 후 응답 반환
**Output**:
```json
{
  "message": "Billing processed",
  "processed": 15,
  "succeeded": 12,
  "failed": 3
}
```
**HTTP Status**: 200 OK

---

## Alternative Flows

### AF-1: 결제 대상이 없는 경우
**Condition**: 오늘 결제일인 구독이 0건
**Flow**:
1. 쿼리 결과 빈 배열 반환
2. Loop 실행 없이 즉시 200 OK 응답
3. 시스템 로그에 "No subscriptions to process" 기록

**Result**: 정상 종료

---

### AF-2: Toss API 타임아웃
**Condition**: 특정 구독의 결제 요청이 30초 이상 응답 없음
**Flow**:
1. `fetch` 타임아웃 발생
2. 해당 구독 건너뛰기 (다른 구독 처리 계속)
3. 시스템 로그에 에러 기록
4. 다음 날 Cron에서 재시도 (next_payment_date 여전히 오늘)

**Result**: 부분 성공 (다른 구독은 정상 처리됨)

---

## Exception Flows

### EX-1: 인증 실패 (Invalid Token)
**Condition**: `CRON_SECRET_TOKEN` 불일치
**Handling**:
1. 401 Unauthorized 응답
2. Supabase Cron은 재시도하지 않음
3. 관리자에게 알림 발송 (모니터링 시스템)

**Error Code**: `401 Unauthorized`
**User Message**: N/A (시스템 내부 작업)

---

### EX-2: 동일 구독 중복 결제 방지
**Condition**: Cron이 실수로 2회 실행되는 경우
**Handling**:
1. 첫 번째 실행에서 `next_payment_date`가 +1개월로 변경됨
2. 두 번째 실행 시 `WHERE next_payment_date = CURRENT_DATE` 조건에서 제외됨
3. 중복 결제 발생하지 않음 (멱등성 보장)

**Safeguard**: 날짜 기반 쿼리 조건

---

### EX-3: BillingKey 삭제 실패
**Condition**: 결제 실패 후 Toss API에서 BillingKey 삭제 요청이 500 에러 반환
**Handling**:
1. Supabase 구독 정보는 정상적으로 'terminated'로 업데이트
2. 시스템 로그에 "BillingKey deletion failed" 기록
3. 관리자에게 수동 삭제 요청 알림

**Impact**: 사용자 데이터는 정상 처리됨, 토스 시스템에 불필요한 BillingKey 잔존 (큰 문제 아님)

---

### EX-4: Database 트랜잭션 실패
**Condition**: Supabase 장애로 UPDATE 쿼리 실패
**Handling**:
1. 다음 날 Cron에서 재시도 (next_payment_date 여전히 어제)
2. 사용자는 일시적으로 쿼터 리셋 안 됨 (서비스 제한)
3. 재시도 시 정상 처리 가능

**Recovery**: 자동 재시도 (다음 날)

---

## Postconditions

### 성공 시
**Database Changes**:
- `subscriptions` 테이블:
  - `quota`: 10으로 리셋
  - `next_payment_date`: +1개월 연장
  - `last_payment_date`: 오늘 날짜로 업데이트

**System State**:
- Pro 구독 상태 유지 (`status: 'active'`)
- 사용자는 다음 달까지 계속 Pro 혜택 이용 가능

**External System**:
- Toss Payments: 결제 완료 기록 저장
- BillingKey: 계속 유효

### 실패 시
**Database Changes**:
- `subscriptions` 테이블:
  - `status`: 'terminated'로 변경
  - `quota`: 0으로 초기화
  - `billing_key`: NULL로 삭제

**System State**:
- 구독 해지 상태
- 사용자는 서비스 이용 불가 (쿼터 0)
- 재구독 필요

**External System**:
- Toss Payments: BillingKey 삭제됨

---

## Business Rules

### BR-1: 결제 시점
- 정기 결제는 **매일 02:00 KST**에 실행됨
- 사용자의 최초 결제일 기준으로 매월 같은 날짜에 결제 (예: 10일 구독 → 매월 10일 결제)

### BR-2: 결제 금액
- Pro 플랜 월 구독료: **9,900원 (고정)**
- 세금 포함 금액, 부가세 별도 없음

### BR-3: 결제 실패 정책
- **재시도 없음**: 1회 결제 실패 시 즉시 구독 해지
- **Graceful Degradation**: 결제일 당일에만 실패 처리, 사전 알림 없음 (향후 개선 필요)

### BR-4: 쿼터 리셋
- 결제 성공 시 **무조건 10회로 리셋** (이전 남은 쿼터 무시)
- 예: 전월 쿼터 3회 남았더라도 → 10회로 리셋

### BR-5: 구독 취소 중인 사용자
- `status = 'cancelled'` 인 경우 결제 대상에서 **제외**됨
- 취소 예정일(`next_payment_date`)에 자동 해지됨 (결제 시도 안 함)

### BR-6: 멱등성 보장
- 같은 날짜에 여러 번 실행되어도 **중복 결제 발생하지 않음**
- `next_payment_date = CURRENT_DATE` 조건으로 자연스럽게 방지

---

## Non-Functional Requirements

### 성능
- **처리 시간**: 구독자 1,000명 기준 5분 이내 완료
- **타임아웃**: 각 Toss API 호출당 30초 타임아웃
- **동시성**: 순차 처리 (병렬 처리 불필요, 트래픽 낮음)

### 보안
- **인증**: CRON_SECRET_TOKEN으로 외부 접근 차단
- **암호화**: Toss API 통신 HTTPS 사용
- **민감 정보**: BillingKey는 서버에서만 처리, 로그에 기록 금지

### 가용성
- **Cron 안정성**: Supabase Cron의 99.9% 가동률 의존
- **Fallback**: Cron 실패 시 다음 날 자동 재시도
- **모니터링**: 매일 Cron 실행 로그 확인 필요

### 에러 처리
- **부분 실패 허용**: 일부 구독 결제 실패 시 나머지는 계속 처리
- **로깅**: 모든 결제 시도 및 결과 로그 기록
- **알림**: 전체 실패 또는 50% 이상 실패 시 관리자 알림

---

## Sequence Diagram

```plantuml
@startuml
participant "Supabase Cron" as Cron
participant "API\n/api/cron/process-billing" as API
participant "Supabase\nDatabase" as DB
participant "Toss Payments\nAPI" as Toss

== 매일 02:00 KST ==

Cron -> API: POST /api/cron/process-billing\nAuthorization: Bearer {token}

alt 인증 실패
    API --> Cron: 401 Unauthorized
else 인증 성공
    API -> DB: SELECT * FROM subscriptions\nWHERE next_payment_date = CURRENT_DATE\nAND status = 'active'
    DB --> API: 결제 대상 목록 반환

    alt 결제 대상 없음
        API --> Cron: 200 OK\n{"processed": 0}
    else 결제 대상 존재

        loop 각 구독별 처리
            API -> Toss: POST /v1/billing/{billingKey}\n{amount: 9900, orderId, orderName}

            alt 결제 성공
                Toss --> API: {status: 'DONE', paymentKey}
                API -> DB: UPDATE subscriptions SET\nquota = 10,\nnext_payment_date = +1개월,\nlast_payment_date = TODAY\nWHERE clerk_user_id = ?
                DB --> API: 업데이트 완료

            else 결제 실패
                Toss --> API: {status: 'FAILED', code, message}
                API -> Toss: DELETE /v1/billing/{billingKey}
                Toss --> API: BillingKey 삭제 완료
                API -> DB: UPDATE subscriptions SET\nstatus = 'terminated',\nquota = 0,\nbilling_key = NULL\nWHERE clerk_user_id = ?
                DB --> API: 업데이트 완료
            end
        end

        API --> Cron: 200 OK\n{"processed": N, "succeeded": M, "failed": K}
    end
end

@enduml
```

---

## Test Scenarios

### 성공 케이스

| TC ID | 입력값 | 기대 결과 |
|-------|--------|----------|
| TC-05-01 | 정상 토큰 + 오늘이 결제일인 Pro 구독 3건 | 3건 모두 결제 성공, quota=10, next_payment_date=+1개월 |
| TC-05-02 | 정상 토큰 + 결제 대상 0건 | 200 OK, processed=0 |
| TC-05-03 | 구독 취소된 사용자 (status='cancelled') | 결제 시도 안 함, 대상에서 제외 |

### 실패 케이스

| TC ID | 입력값 | 기대 결과 |
|-------|--------|----------|
| TC-05-04 | 잘못된 토큰 | 401 Unauthorized, 결제 처리 안 됨 |
| TC-05-05 | 결제 실패 응답 (카드 만료) | status='terminated', quota=0, billing_key=NULL |
| TC-05-06 | Toss API 타임아웃 | 해당 구독 건너뛰기, 다른 구독은 정상 처리 |
| TC-05-07 | Database 장애 | 500 에러, 다음 날 재시도 |

---

## Related Use Cases

- **선행 유스케이스**: UC-02 (Pro 구독 결제) - BillingKey 발급 필요
- **연관 유스케이스**:
  - UC-04 (구독 취소 및 재활성화) - 취소된 구독은 결제 대상에서 제외
  - UC-03 (사주 분석 이용) - 결제 성공 시 쿼터 리셋으로 다시 분석 가능

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0  | 2025-10-26 | System | 초기 작성 |

---

## 부록

### A. Cron 설정 방법 (Supabase)

Supabase Dashboard → Database → Cron Jobs

```sql
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

### B. 환경 변수

```bash
# .env.local
CRON_SECRET_TOKEN=your-random-secure-token-here
TOSS_SECRET_KEY=test_sk_xxxxxxxxxxxxxxxxxxxxx
```

### C. 모니터링 쿼리

```sql
-- 오늘 결제 예정 구독 수 확인
SELECT COUNT(*) as payment_due_today
FROM subscriptions
WHERE next_payment_date = CURRENT_DATE
  AND status = 'active';

-- 최근 결제 실패 구독 조회
SELECT
  clerk_user_id,
  status,
  last_payment_date,
  next_payment_date
FROM subscriptions
WHERE status = 'terminated'
  AND last_payment_date IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

### D. 참고 자료

- [Toss Payments 정기 결제 API 문서](https://docs.tosspayments.com/reference/billing)
- [Supabase Cron 공식 문서](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**문서 상태**: Draft (검토 필요)
**검토자**: Product Owner, Dev Lead
**승인일**: TBD
