/**
 * 공통 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
  /**
   * 인증 관련 에러
   */
  AUTH: {
    UNAUTHORIZED: '로그인이 필요합니다',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
    FORBIDDEN: '접근 권한이 없습니다',
    INVALID_TOKEN: '유효하지 않은 인증 토큰입니다',
  },

  /**
   * 사주 분석 관련 에러
   */
  ANALYSIS: {
    QUOTA_EXCEEDED: '사용 가능한 횟수가 없습니다. Pro 구독이 필요합니다',
    API_ERROR: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
    NOT_FOUND: '존재하지 않는 분석입니다',
    INVALID_INPUT: '입력 정보가 올바르지 않습니다',
  },

  /**
   * 구독 관련 에러
   */
  SUBSCRIPTION: {
    ALREADY_SUBSCRIBED: '이미 Pro 구독 중입니다',
    PAYMENT_FAILED: '결제 중 오류가 발생했습니다',
    CANCEL_FAILED: '구독 취소 중 오류가 발생했습니다',
    NOT_FOUND: '구독 정보를 찾을 수 없습니다',
    BILLING_KEY_REQUIRED: '결제 수단이 등록되지 않았습니다',
  },

  /**
   * 네트워크 및 서버 에러
   */
  NETWORK: {
    TIMEOUT: '네트워크 연결을 확인해주세요',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
    BAD_REQUEST: '잘못된 요청입니다',
  },

  /**
   * 일반 에러
   */
  COMMON: {
    UNKNOWN: '알 수 없는 오류가 발생했습니다',
    VALIDATION_FAILED: '입력 값 검증에 실패했습니다',
    REQUIRED_FIELD: '필수 항목입니다',
  },
} as const;

/**
 * 공통 성공 메시지 상수
 */
export const SUCCESS_MESSAGES = {
  /**
   * 인증 관련 성공 메시지
   */
  AUTH: {
    LOGIN_SUCCESS: '로그인되었습니다',
    SIGNUP_SUCCESS: '회원가입이 완료되었습니다! 무료 분석 3회를 드립니다',
    LOGOUT_SUCCESS: '로그아웃되었습니다',
  },

  /**
   * 사주 분석 관련 성공 메시지
   */
  ANALYSIS: {
    COMPLETED: '분석이 완료되었습니다!',
    DELETED: '분석이 삭제되었습니다',
  },

  /**
   * 구독 관련 성공 메시지
   */
  SUBSCRIPTION: {
    SUBSCRIBED: 'Pro 구독이 완료되었습니다!',
    CANCELLED: '구독이 취소되었습니다',
    REACTIVATED: '구독이 재활성화되었습니다',
    TERMINATED: '구독이 해지되었습니다',
  },

  /**
   * 일반 성공 메시지
   */
  COMMON: {
    SAVED: '저장되었습니다',
    UPDATED: '수정되었습니다',
    DELETED: '삭제되었습니다',
  },
} as const;
