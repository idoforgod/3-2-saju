/**
 * 토스페이먼츠 에러 코드 매핑
 * 참고: https://docs.tosspayments.com/reference/error-codes
 */
export const TOSS_ERROR_MESSAGES: Record<string, string> = {
  CARD_LIMIT_EXCEEDED: '카드 한도를 초과했습니다',
  INVALID_CARD: '유효하지 않은 카드입니다',
  LOST_CARD: '분실/정지된 카드입니다',
  INSUFFICIENT_BALANCE: '잔액이 부족합니다',
  EXPIRED_CARD: '유효기간이 만료된 카드입니다',
  INVALID_CVC: 'CVC 번호가 올바르지 않습니다',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다',
  TIMEOUT: '요청 시간이 초과되었습니다',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
  DUPLICATED_ORDER_ID: '이미 처리된 주문입니다',
  INVALID_BILLING_KEY: '유효하지 않은 결제 수단입니다',
  BILLING_KEY_EXPIRED: '결제 수단이 만료되었습니다',
  BILLING_KEY_DELETED: '삭제된 결제 수단입니다',
};

/**
 * 토스페이먼츠 에러를 사용자 친화적 메시지로 변환
 * @param error - 토스페이먼츠 API 에러 객체
 * @returns 사용자에게 표시할 에러 메시지
 */
export function parseTossError(error: any): string {
  const errorCode = error?.code || error?.response?.data?.code || 'UNKNOWN_ERROR';
  return TOSS_ERROR_MESSAGES[errorCode] || TOSS_ERROR_MESSAGES.UNKNOWN_ERROR;
}
