# UC-006: Pro 구독 관리

## 1. 유스케이스 개요

### 1.1 유스케이스 식별자
- **ID**: UC-006
- **이름**: Pro 구독 관리
- **버전**: 1.0
- **작성일**: 2025-10-25

### 1.2 유스케이스 설명
사용자가 무료 플랜에서 Pro 플랜으로 업그레이드하고, 구독 상태를 관리(취소, 재활성화, 해지)하는 기능입니다. 토스페이먼츠를 통한 정기 결제를 지원하며, 매월 자동 결제 및 쿼터 리셋이 이루어집니다.

### 1.3 범위
- Pro 구독 신청 및 첫 결제
- 구독 상태 조회
- 구독 취소 요청
- 취소된 구독 재활성화
- 구독 즉시 해지
- 정기 결제 자동화 (Supabase Cron)

### 1.4 우선순위
**High** - 서비스 수익화를 위한 핵심 기능

---

## 2. 액터 (Actors)

### 2.1 주 액터 (Primary Actor)
- **사용자 (User)**: 무료 쿼터 소진 후 Pro 구독을 원하는 인증된 사용자

### 2.2 보조 액터 (Secondary Actors)
- **시스템 (Cron Job)**: 매일 02:00 KST에 정기 결제 자동 실행
- **토스페이먼츠 API**: BillingKey 발급 및 정기 결제 처리
- **Supabase Database**: 구독 정보 저장 및 관리

---

## 3. 사전 조건 (Preconditions)

### 3.1 필수 조건
1. **사용자 인증**: Clerk를 통해 로그인된 상태여야 함
2. **초기 구독 상태**: `subscriptions` 테이블에 사용자 레코드 존재 (가입 시 자동 생성)
3. **무료 쿼터 소진**: `plan_type = 'free'` && `quota = 0` (Pro 구독 유도 시점)
4. **결제 수단**: 사용자가 유효한 신용/체크 카드 소지

### 3.2 시스템 상태
- Supabase 데이터베이스 정상 작동
- 토스페이먼츠 API 정상 작동
- 토스 결제 위젯 로드 가능
- Supabase Cron Job 활성화

---

## 4. 기본 플로우 (Main Flow)

### 4.1 Pro 구독 신청 및 첫 결제

#### Step 1: 구독 페이지 접속
**액터**: 사용자
**액션**:
1. 쿼터 소진 후 "구독하기" 버튼 클릭 또는 네비게이션 → "구독 관리" 메뉴 클릭
2. `/subscription` 페이지로 이동

**시스템 응답**:
```sql
SELECT plan_type, status, quota, next_payment_date, cancelled_at
FROM subscriptions
WHERE user_id = :clerk_user_id;
```
- `plan_type = 'free'` 확인 → Pro 플랜 소개 화면 표시
  - 월 10회 분석
  - Gemini Pro 모델 사용
  - 월 9,900원

#### Step 2: 결제 정보 입력
**액터**: 사용자
**액션**:
1. "Pro 구독하기" 버튼 클릭
2. 토스페이먼츠 결제 위젯 로드
3. 카드 정보 입력:
   - 카드 번호 (16자리)
   - 유효기간 (MM/YY)
   - CVC (3자리)
   - 생년월일 (YYMMDD, 개인)/사업자번호 (법인)
4. 약관 동의 체크:
   - 정기 결제 약관
   - 개인정보 수집/이용 동의

**시스템 응답**:
- 토스 결제 위젯 로드 성공 → 카드 정보 입력 폼 표시
- 로드 실패 → "결제 시스템을 불러올 수 없습니다. 잠시 후 다시 시도해주세요" 에러 메시지

#### Step 3: BillingKey 발급 및 첫 결제
**액터**: 사용자
**액션**: "결제하기" 버튼 클릭

**시스템 처리**:
1. 토스페이먼츠 API 호출: BillingKey 발급 요청
```javascript
// Frontend → Toss Widget
const billingKey = await tossPayments.requestBillingAuth({
  customerKey: clerk_user_id,
  successUrl: `${window.location.origin}/subscription/callback?success=true`,
  failUrl: `${window.location.origin}/subscription/callback?success=false`,
});
```

2. BillingKey로 첫 결제 (9,900원) 즉시 실행
```javascript
// Backend API: /api/payments/subscribe
const payment = await tossPayments.billing({
  billingKey: billingKey,
  amount: 9900,
  orderName: "사주분석 Pro 구독",
  customerEmail: user.email,
  customerName: user.name,
});
```

3. 결제 성공 시 Supabase 업데이트
```sql
UPDATE subscriptions
SET plan_type = 'pro',
    status = 'active',
    billing_key = :billing_key,
    quota = 10,
    next_payment_date = CURRENT_DATE + INTERVAL '1 month',
    last_payment_date = CURRENT_DATE,
    updated_at = NOW()
WHERE user_id = :clerk_user_id;
```

**시스템 응답**:
- 결제 성공 (HTTP 200):
  - "Pro 구독이 완료되었습니다!" 토스트 메시지
  - 대시보드(`/dashboard`)로 리다이렉트
  - 남은 횟수 10회 표시
- 결제 실패 (HTTP 400):
  - 토스 에러 메시지 표시 (예: "카드 한도 초과", "유효하지 않은 카드")
  - 결제 정보 재입력 유도

---

### 4.2 구독 상태 조회

#### Step 1: 구독 페이지 접속
**액터**: Pro 구독자
**시스템 응답**:
```sql
SELECT plan_type, status, quota, next_payment_date, last_payment_date, cancelled_at
FROM subscriptions
WHERE user_id = :clerk_user_id;
```

**화면 표시 (status = 'active')**:
- "Pro 구독 중" 상태 표시
- 다음 결제일: `{next_payment_date}`
- 남은 분석 횟수: `{quota}회`
- 결제 금액: 월 9,900원
- 액션 버튼: "구독 취소"

---

### 4.3 구독 취소 요청

#### Step 1: 취소 확인
**액터**: Pro 구독자
**액션**: "구독 취소" 버튼 클릭

**시스템 응답**:
- 취소 확인 모달 표시:
  ```
  구독을 취소하시겠습니까?

  - 다음 결제일({next_payment_date})까지 Pro 기능을 계속 사용할 수 있습니다.
  - 결제일 전까지 언제든지 재활성화할 수 있습니다.
  - 결제일 이후에는 무료 플랜으로 전환됩니다.

  [취소] [확인]
  ```

#### Step 2: 취소 처리
**액터**: 사용자
**액션**: 모달에서 "확인" 클릭

**시스템 처리**:
```javascript
// API: POST /api/subscription/cancel
const response = await fetch('/api/subscription/cancel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`,
  },
});
```

```sql
UPDATE subscriptions
SET status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
WHERE user_id = :clerk_user_id
  AND status = 'active';
```

**시스템 응답**:
- HTTP 200 성공:
  - "구독이 취소되었습니다. {next_payment_date}까지 Pro 기능을 사용할 수 있습니다." 토스트
  - 화면 갱신: 상태 → "취소 예정"
  - 액션 버튼: "재활성화", "즉시 해지"
- HTTP 400 실패:
  - "구독 취소 중 오류가 발생했습니다. 다시 시도해주세요." 에러 메시지

---

### 4.4 취소된 구독 재활성화

#### Step 1: 재활성화 요청
**액터**: 취소 상태의 구독자
**사전 조건**:
- `status = 'cancelled'`
- `next_payment_date > CURRENT_DATE` (결제일 전)

**액션**: "재활성화" 버튼 클릭

**시스템 처리**:
```javascript
// API: POST /api/subscription/reactivate
```

```sql
UPDATE subscriptions
SET status = 'active',
    cancelled_at = NULL,
    updated_at = NOW()
WHERE user_id = :clerk_user_id
  AND status = 'cancelled'
  AND next_payment_date > CURRENT_DATE;
```

**시스템 응답**:
- HTTP 200 성공:
  - "구독이 재활성화되었습니다." 토스트
  - 화면 갱신: 상태 → "Pro 구독 중"
  - `next_payment_date`에 정기 결제 예정
- HTTP 400 실패 (결제일 초과):
  - "결제일이 지나 재활성화할 수 없습니다. 다시 구독해주세요." 에러 메시지

---

### 4.5 구독 즉시 해지

#### Step 1: 해지 확인
**액터**: 취소 상태의 구독자
**액션**: "즉시 해지" 버튼 클릭

**시스템 응답**:
- 해지 확인 모달:
  ```
  구독을 즉시 해지하시겠습니까?

  ⚠️ 경고:
  - 남은 기간에 상관없이 즉시 무료 플랜으로 전환됩니다.
  - 남은 분석 횟수가 모두 삭제됩니다.
  - 저장된 결제 정보(BillingKey)가 삭제됩니다.
  - 재구독 시 결제 정보를 다시 입력해야 합니다.

  [취소] [해지하기]
  ```

#### Step 2: 해지 처리
**액터**: 사용자
**액션**: "해지하기" 클릭

**시스템 처리**:
```javascript
// API: POST /api/subscription/terminate
```

1. 토스페이먼츠 BillingKey 삭제
```javascript
await tossPayments.deleteBillingKey(billingKey);
```

2. Supabase 구독 정보 업데이트
```sql
UPDATE subscriptions
SET status = 'terminated',
    billing_key = NULL,
    quota = 0,
    next_payment_date = NULL,
    updated_at = NOW()
WHERE user_id = :clerk_user_id;
```

**시스템 응답**:
- HTTP 200 성공:
  - "구독이 해지되었습니다." 토스트
  - 무료 플랜 화면으로 전환
  - 쿼터 0회 표시
- HTTP 500 실패 (BillingKey 삭제 오류):
  - "해지 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요." 에러
  - 로그 기록 → 관리자 수동 처리 필요

---

### 4.6 정기 결제 자동화 (Cron Job)

#### Step 1: Cron 트리거
**액터**: Supabase Cron (시스템)
**실행 시간**: 매일 UTC 17:00 (KST 02:00)

**Supabase Cron 설정**:
```sql
SELECT cron.schedule(
  'process-daily-billing',
  '0 17 * * *',  -- UTC 17:00 = KST 02:00
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

#### Step 2: 결제 대상 조회
**시스템 처리**:
```javascript
// API: POST /api/cron/process-billing
// 1. Cron 인증 토큰 검증
const authHeader = req.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

```sql
-- 2. 오늘이 결제일인 활성 구독 조회
SELECT id, user_id, billing_key, quota
FROM subscriptions
WHERE status = 'active'
  AND next_payment_date = CURRENT_DATE;
```

#### Step 3: 각 구독 결제 처리
**시스템 처리 (Loop)**:
```javascript
for (const subscription of subscriptions) {
  try {
    // 1. 토스페이먼츠 결제 요청
    const payment = await tossPayments.billing({
      billingKey: subscription.billing_key,
      amount: 9900,
      orderName: '사주분석 Pro 구독',
      customerKey: subscription.user_id,
    });

    if (payment.status === 'DONE') {
      // 2. 결제 성공: 쿼터 리셋 + 다음 결제일 연장
      await supabase
        .from('subscriptions')
        .update({
          quota: 10,
          next_payment_date: addMonths(CURRENT_DATE, 1),
          last_payment_date: CURRENT_DATE,
          updated_at: NOW(),
        })
        .eq('id', subscription.id);

      // 3. 결제 성공 로그 기록
      console.log(`[SUCCESS] User ${subscription.user_id} - 9,900원 결제 완료`);
    }
  } catch (error) {
    // 4. 결제 실패: 즉시 해지
    await supabase
      .from('subscriptions')
      .update({
        status: 'terminated',
        billing_key: null,
        quota: 0,
        next_payment_date: null,
        updated_at: NOW(),
      })
      .eq('id', subscription.id);

    // 5. BillingKey 삭제
    await tossPayments.deleteBillingKey(subscription.billing_key);

    // 6. 결제 실패 알림 (이메일 또는 푸시)
    await sendFailureNotification(subscription.user_id, error.message);

    console.error(`[FAILURE] User ${subscription.user_id} - ${error.message}`);
  }
}
```

**시스템 응답**:
- HTTP 200 (모든 처리 완료):
  ```json
  {
    "message": "Billing processed",
    "total": 50,
    "success": 48,
    "failed": 2
  }
  ```

---

## 5. 대안 플로우 (Alternative Flows)

### 5.1 중복 구독 시도
**트리거**: 이미 `plan_type = 'pro'` 상태에서 구독 버튼 클릭

**시스템 처리**:
```sql
SELECT plan_type FROM subscriptions WHERE user_id = :clerk_user_id;
```
- `plan_type = 'pro'` 확인 → "이미 Pro 구독 중입니다" 토스트
- 구독 관리 페이지로 자동 이동

### 5.2 결제일 후 재활성화 시도
**트리거**: `status = 'cancelled'` && `next_payment_date <= CURRENT_DATE`

**시스템 처리**:
```sql
UPDATE subscriptions
SET status = 'active', cancelled_at = NULL
WHERE user_id = :clerk_user_id
  AND status = 'cancelled'
  AND next_payment_date > CURRENT_DATE;  -- 조건 미충족 시 UPDATE 실패
```

**시스템 응답**:
- HTTP 400 에러: "결제일이 지나 재활성화할 수 없습니다. 다시 구독해주세요."
- "Pro 구독하기" 버튼 표시 (새 BillingKey 발급 필요)

### 5.3 무료 플랜 전환 (자동)
**트리거**: Cron Job에서 `next_payment_date` 도래 + 결제 실패 또는 취소 상태 유지

**시스템 처리**:
```sql
UPDATE subscriptions
SET plan_type = 'free',
    status = 'active',
    quota = 0,  -- 무료 쿼터는 초기 3회만 제공, 재전환 시 0회
    billing_key = NULL,
    next_payment_date = NULL
WHERE status = 'cancelled'
  AND next_payment_date <= CURRENT_DATE;
```

**시스템 응답**:
- 사용자에게 알림 (이메일 또는 푸시):
  ```
  Pro 구독이 종료되어 무료 플랜으로 전환되었습니다.
  다시 Pro 구독을 원하시면 언제든지 구독해주세요!
  ```

---

## 6. 예외 플로우 (Exception Flows)

### 6.1 결제 실패 (첫 구독 시)
**트리거**: BillingKey 발급 성공 후 첫 결제 실패

**원인**:
- 카드 한도 초과
- 유효하지 않은 카드
- 분실/정지된 카드
- 잔액 부족

**시스템 처리**:
```javascript
// API: /api/payments/subscribe
try {
  const payment = await tossPayments.billing({...});
} catch (error) {
  // 1. BillingKey 삭제
  await tossPayments.deleteBillingKey(billingKey);

  // 2. 구독 상태 유지 (plan_type = 'free')
  // (subscriptions 테이블 업데이트 안 함)

  return NextResponse.json({
    error: 'PAYMENT_FAILED',
    message: error.message,  // 예: "카드 한도를 초과했습니다"
  }, { status: 400 });
}
```

**사용자 응답**:
- 에러 메시지 표시: "{토스 에러 메시지}"
- 안내: "다른 카드로 다시 시도하거나 카드 상태를 확인해주세요."
- "다시 시도" 버튼 제공

### 6.2 BillingKey 삭제 실패
**트리거**: 해지 시 토스 API 오류

**시스템 처리**:
```javascript
try {
  await tossPayments.deleteBillingKey(billingKey);
} catch (error) {
  // 1. Supabase는 일단 업데이트 (사용자에게는 해지 완료)
  await supabase.from('subscriptions').update({
    status: 'terminated',
    billing_key: null,
    quota: 0,
  });

  // 2. 로그 기록 + 관리자 알림
  console.error(`[CRITICAL] BillingKey 삭제 실패: ${billingKey}`);
  await notifyAdmin({
    level: 'CRITICAL',
    message: `User ${userId} - BillingKey 수동 삭제 필요`,
    billingKey: billingKey,
  });
}
```

**사용자 응답**:
- "구독이 해지되었습니다" 정상 메시지 표시
- 내부적으로 관리자 수동 처리 대기

### 6.3 Cron Job 인증 실패
**트리거**: 잘못된 `CRON_SECRET_TOKEN` 또는 헤더 누락

**시스템 처리**:
```javascript
if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
  console.error(`[UNAUTHORIZED] Cron 인증 실패 - IP: ${req.ip}`);
  await notifyAdmin({
    level: 'WARNING',
    message: 'Cron Job 인증 실패 감지',
    ip: req.ip,
  });
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**시스템 응답**:
- HTTP 401 반환
- 관리자 즉시 알림 (보안 이슈 가능성)

### 6.4 Cron Job 결제 실패 대량 발생
**트리거**: 토스 API 장애로 여러 구독 결제 동시 실패

**시스템 처리**:
```javascript
const failedCount = subscriptions.filter(s => s.failed).length;
if (failedCount > subscriptions.length * 0.1) {  // 10% 이상 실패
  await notifyAdmin({
    level: 'CRITICAL',
    message: `대량 결제 실패 감지: ${failedCount}/${subscriptions.length}건`,
    action: '토스페이먼츠 API 상태 확인 필요',
  });
}
```

**복구 절차**:
1. 토스페이먼츠 API 상태 확인
2. 정상화 후 실패 건 수동 재시도:
   ```bash
   curl -X POST https://yourdomain.vercel.app/api/cron/process-billing \
     -H "Authorization: Bearer ${CRON_SECRET_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"retry": true, "date": "2025-10-25"}'
   ```

---

## 7. 사후 조건 (Postconditions)

### 7.1 성공 시나리오

#### Pro 구독 성공
- `subscriptions.plan_type = 'pro'`
- `subscriptions.status = 'active'`
- `subscriptions.billing_key` 저장됨
- `subscriptions.quota = 10`
- `subscriptions.next_payment_date = CURRENT_DATE + 1개월`
- `subscriptions.last_payment_date = CURRENT_DATE`
- 사용자 대시보드에 Pro 뱃지 표시

#### 구독 취소 성공
- `subscriptions.status = 'cancelled'`
- `subscriptions.cancelled_at = NOW()`
- `subscriptions.billing_key` 유지 (재활성화 가능)
- `next_payment_date`까지 Pro 기능 사용 가능

#### 재활성화 성공
- `subscriptions.status = 'active'`
- `subscriptions.cancelled_at = NULL`
- 기존 `billing_key`로 다음 결제일에 자동 결제

#### 해지 성공
- `subscriptions.status = 'terminated'`
- `subscriptions.billing_key = NULL`
- `subscriptions.quota = 0`
- `subscriptions.next_payment_date = NULL`
- 토스페이먼츠에서 BillingKey 삭제됨

#### 정기 결제 성공
- `subscriptions.quota = 10` (리셋)
- `subscriptions.next_payment_date += 1개월`
- `subscriptions.last_payment_date = CURRENT_DATE`
- 사용자에게 결제 완료 알림 (선택적)

### 7.2 실패 시나리오

#### 결제 실패 (Cron)
- `subscriptions.status = 'terminated'`
- `subscriptions.billing_key = NULL`
- `subscriptions.quota = 0`
- 사용자에게 결제 실패 알림 발송
- 재구독 시 새 BillingKey 필요

---

## 8. 비기능 요구사항 (Non-Functional Requirements)

### 8.1 성능 요구사항
- **결제 위젯 로드 시간**: 2초 이내
- **결제 처리 시간**: 5초 이내
- **Cron Job 실행 시간**: 100명 기준 30초 이내
- **API 응답 시간**: 500ms 이내 (구독 조회)

### 8.2 보안 요구사항
- **BillingKey 암호화**: DB에 평문 저장 (토스 토큰화됨), 서버 사이드에서만 접근
- **Cron 인증**: `CRON_SECRET_TOKEN` 검증 필수
- **클라이언트 노출 방지**: BillingKey는 절대 클라이언트에 노출 금지
- **HTTPS 전송**: 모든 결제 통신은 HTTPS 필수
- **PCI-DSS 준수**: 토스페이먼츠가 담당 (직접 카드 정보 저장 안 함)

### 8.3 안정성 요구사항
- **Cron Job 실패 알림**: 1회 실패 시 관리자 즉시 알림
- **결제 재시도**: Cron Job 실패 시 수동 재실행 가능
- **트랜잭션 무결성**: 결제 성공/실패 시 DB 원자적 업데이트
- **에러 로깅**: 모든 결제 실패는 상세 로그 기록

### 8.4 사용성 요구사항
- **명확한 안내**: 취소/해지 차이 명확히 설명
- **피드백**: 모든 액션에 즉시 토스트 메시지 표시
- **에러 메시지**: 토스 에러 메시지 그대로 표시 (사용자 이해 가능)
- **복구 경로**: 실패 시 "다시 시도" 또는 "고객센터 문의" 버튼 제공

### 8.5 확장성 요구사항
- **대량 결제 처리**: Cron Job에서 1000명 동시 결제 가능
- **토스 API Rate Limit**: 초당 100회 제한 고려 (필요 시 배치 처리)
- **DB Connection Pool**: Supabase Connection Pool 활용

---

## 9. 인수 기준 (Acceptance Criteria)

### 9.1 기능 검증

#### AC-1: Pro 구독 신청
- [ ] 무료 유저가 "Pro 구독하기" 버튼 클릭 시 토스 결제 위젯 정상 로드
- [ ] 카드 정보 입력 및 약관 동의 후 BillingKey 발급 성공
- [ ] 첫 결제 9,900원 즉시 처리
- [ ] Supabase `subscriptions` 테이블 업데이트 확인:
  - `plan_type = 'pro'`
  - `status = 'active'`
  - `billing_key` 저장
  - `quota = 10`
  - `next_payment_date = 1개월 후`
- [ ] 대시보드에 Pro 뱃지 및 10회 쿼터 표시

#### AC-2: 구독 상태 조회
- [ ] Pro 구독자가 `/subscription` 접속 시 현재 상태 표시:
  - 다음 결제일
  - 남은 횟수
  - 결제 금액
- [ ] "구독 취소" 버튼 표시

#### AC-3: 구독 취소
- [ ] "구독 취소" 버튼 클릭 시 확인 모달 표시
- [ ] 확인 후 `status = 'cancelled'`, `cancelled_at` 기록
- [ ] 안내 메시지: "{next_payment_date}까지 Pro 사용 가능"
- [ ] 화면에 "재활성화", "즉시 해지" 버튼 표시

#### AC-4: 재활성화
- [ ] 취소 상태에서 "재활성화" 버튼 클릭 시 `status = 'active'` 복원
- [ ] `cancelled_at = NULL`
- [ ] "구독이 재활성화되었습니다" 토스트
- [ ] 결제일 초과 시 재활성화 불가 에러 표시

#### AC-5: 즉시 해지
- [ ] "즉시 해지" 버튼 클릭 시 경고 모달 표시
- [ ] 확인 후 토스 BillingKey 삭제 성공
- [ ] Supabase 업데이트:
  - `status = 'terminated'`
  - `billing_key = NULL`
  - `quota = 0`
- [ ] 무료 플랜 화면으로 전환

#### AC-6: 정기 결제 (Cron)
- [ ] 매일 02:00 KST Cron Job 트리거
- [ ] Cron 인증 토큰 검증 성공
- [ ] 오늘이 결제일인 구독 조회 성공
- [ ] 각 구독 BillingKey로 결제 요청
- [ ] 결제 성공 시:
  - `quota = 10` 리셋
  - `next_payment_date += 1개월`
  - `last_payment_date = CURRENT_DATE`
- [ ] 결제 실패 시:
  - `status = 'terminated'`
  - `billing_key = NULL`
  - BillingKey 삭제
  - 사용자 알림 발송

### 9.2 비기능 검증

#### AC-7: 성능
- [ ] 결제 위젯 로드 시간 < 2초
- [ ] 결제 처리 시간 < 5초
- [ ] Cron Job (100명) 실행 시간 < 30초

#### AC-8: 보안
- [ ] BillingKey는 API 응답에 포함 안 됨 (클라이언트 노출 방지)
- [ ] Cron API는 유효한 토큰 없이 401 반환
- [ ] 모든 결제 통신 HTTPS 강제

#### AC-9: 에러 핸들링
- [ ] 결제 실패 시 토스 에러 메시지 표시
- [ ] BillingKey 삭제 실패 시 관리자 알림
- [ ] Cron 인증 실패 시 로그 기록 및 알림

### 9.3 엣지 케이스 검증

#### AC-10: 중복 구독 방지
- [ ] 이미 Pro 상태에서 구독 시도 시 "이미 구독 중" 메시지

#### AC-11: 결제일 후 재활성화 차단
- [ ] `next_payment_date` 이후 재활성화 시도 시 에러 메시지

#### AC-12: 무료 전환 자동화
- [ ] 취소 상태 + 결제일 도래 시 `plan_type = 'free'` 자동 전환

---

## 10. 데이터 모델

### 10.1 관련 테이블

#### `subscriptions` 테이블 (핵심)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) UNIQUE NOT NULL,  -- FK → users.clerk_user_id
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active' | 'cancelled' | 'terminated'
  billing_key VARCHAR(255),  -- 토스페이먼츠 BillingKey
  quota INTEGER NOT NULL DEFAULT 3,  -- 무료: 3, Pro: 10
  next_payment_date DATE,  -- 다음 결제 예정일
  last_payment_date DATE,  -- 마지막 결제일
  cancelled_at TIMESTAMP,  -- 구독 취소 요청 시간
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10.2 상태 전이 다이어그램
```
[free] → (Pro 구독) → [pro/active]
                           ↓
                    (구독 취소)
                           ↓
                   [pro/cancelled]
                    ↓           ↓
           (재활성화)      (즉시 해지 또는 결제일 도래)
                    ↓           ↓
              [pro/active]  [terminated]
                               ↓
                        (재구독 필요)
```

---

## 11. 외부 시스템 연동

### 11.1 토스페이먼츠 API

#### 엔드포인트 1: BillingKey 발급
- **URL**: `https://api.tosspayments.com/v1/billing/authorizations/issue`
- **Method**: POST
- **Headers**: `Authorization: Basic {Base64(secretKey:)}`
- **Body**:
```json
{
  "customerKey": "clerk_user_id",
  "authKey": "토스 위젯에서 받은 authKey"
}
```
- **Response**:
```json
{
  "billingKey": "BK_xxxxxxxxxxxxx",
  "authenticatedAt": "2025-10-25T12:00:00+09:00"
}
```

#### 엔드포인트 2: BillingKey로 결제
- **URL**: `https://api.tosspayments.com/v1/billing/{billingKey}`
- **Method**: POST
- **Body**:
```json
{
  "amount": 9900,
  "orderName": "사주분석 Pro 구독",
  "customerEmail": "user@example.com",
  "customerName": "홍길동"
}
```
- **Response** (성공):
```json
{
  "orderId": "ORDER_xxxxxxxxxxxxx",
  "status": "DONE",
  "approvedAt": "2025-10-25T12:00:00+09:00"
}
```

#### 엔드포인트 3: BillingKey 삭제
- **URL**: `https://api.tosspayments.com/v1/billing/authorizations/{billingKey}`
- **Method**: DELETE
- **Response**:
```json
{
  "billingKey": "BK_xxxxxxxxxxxxx",
  "deletedAt": "2025-10-25T12:00:00+09:00"
}
```

### 11.2 Supabase Cron

#### Cron Job 설정
- **스케줄**: `0 17 * * *` (UTC 17:00 = KST 02:00)
- **트리거 URL**: `https://yourdomain.vercel.app/api/cron/process-billing`
- **인증**: Bearer Token (`CRON_SECRET_TOKEN`)
- **타임아웃**: 60초
- **재시도**: 없음 (실패 시 관리자 알림)

---

## 12. 테스트 시나리오

### 12.1 단위 테스트 (Unit Tests)

#### UT-1: BillingKey 발급
```typescript
describe('POST /api/payments/subscribe', () => {
  it('should issue billingKey and charge first payment', async () => {
    const response = await fetch('/api/payments/subscribe', {
      method: 'POST',
      body: JSON.stringify({ authKey: 'test_auth_key' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.billingKey).toBeDefined();
    expect(data.plan_type).toBe('pro');
  });
});
```

#### UT-2: 구독 취소
```typescript
describe('POST /api/subscription/cancel', () => {
  it('should cancel active subscription', async () => {
    const response = await fetch('/api/subscription/cancel', {
      method: 'POST',
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('cancelled');
    expect(data.cancelled_at).toBeDefined();
  });
});
```

### 12.2 통합 테스트 (Integration Tests)

#### IT-1: Pro 구독 전체 플로우
1. 무료 유저로 로그인
2. `/subscription` 접속 → Pro 소개 화면 확인
3. "Pro 구독하기" 클릭 → 토스 위젯 로드
4. 테스트 카드 정보 입력 (토스 제공)
5. 결제 성공 확인
6. Supabase `subscriptions` 테이블 검증:
   - `plan_type = 'pro'`
   - `status = 'active'`
   - `quota = 10`
7. 대시보드에서 Pro 뱃지 확인

#### IT-2: 구독 취소 → 재활성화
1. Pro 구독자로 로그인
2. "구독 취소" 클릭 → 확인 모달
3. 취소 완료 → `status = 'cancelled'` 확인
4. "재활성화" 클릭 → `status = 'active'` 복원
5. `cancelled_at = NULL` 확인

#### IT-3: 정기 결제 Cron
1. 테스트 구독 생성 (`next_payment_date = TODAY`)
2. Cron API 수동 호출 (Bearer 토큰 포함)
3. 결제 성공 확인
4. `quota = 10` 리셋, `next_payment_date += 1개월` 확인

### 12.3 E2E 테스트 (End-to-End Tests)

#### E2E-1: 무료 → Pro 구독 → 분석 → 취소
1. 신규 가입 (Google OAuth)
2. 무료 3회 분석 모두 소진
3. Pro 구독 신청 (테스트 카드)
4. 10회 분석 중 5회 사용
5. 구독 취소 요청
6. 남은 5회로 분석 계속 사용
7. 결제일 도래 시 무료 전환 확인

---

## 13. 용어 정리

| 용어 | 정의 |
|------|------|
| **BillingKey** | 토스페이먼츠에서 발급하는 정기 결제용 토큰 (실제 카드 번호 X) |
| **쿼터 (Quota)** | 남은 분석 가능 횟수 (무료: 3회, Pro: 월 10회) |
| **구독 취소 (Cancel)** | 다음 결제일까지 Pro 유지, 이후 무료 전환 |
| **즉시 해지 (Terminate)** | BillingKey 삭제, 즉시 무료 전환, 재구독 필요 |
| **재활성화 (Reactivate)** | 취소한 구독을 결제일 전 복원 |
| **정기 결제 (Recurring Payment)** | 매월 자동 결제 (BillingKey 사용) |
| **Cron Job** | Supabase에서 매일 02:00 KST 실행되는 정기 결제 스케줄러 |

---

## 14. 참고 문서

- **PRD**: `/docs/prd.md` (구독 정책 상세)
- **Userflow**: `/docs/userflow.md` (섹션 7, 8 - Pro 구독 플로우)
- **Database**: `/docs/database.md` (subscriptions 테이블 스키마)
- **토스페이먼츠 API 문서**: https://docs.tosspayments.com/reference/billing
- **Supabase Cron 가이드**: https://supabase.com/docs/guides/database/extensions/pg_cron

---

**문서 버전**: 1.0
**작성일**: 2025-10-25
**작성자**: Claude (AI Assistant)
**검토자**: -
**승인자**: -
