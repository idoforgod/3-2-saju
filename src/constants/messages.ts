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
