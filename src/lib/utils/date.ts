import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅
 * @param date - Date 객체 또는 ISO 문자열
 * @returns 'yyyy-MM-dd HH:mm' 형식의 문자열
 */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko });
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param date - Date 객체 또는 ISO 문자열
 * @returns 'yyyy년 MM월 dd일' 형식의 문자열
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko });
}

/**
 * 시간을 한국어 형식으로 포맷팅 (HH:MM → 오전/오후 형식)
 * @param time - 'HH:MM' 형식의 시간 문자열
 * @returns '오전/오후 h시 mm분' 형식의 문자열
 */
export function formatTime(time: string): string {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? '오후' : '오전';
  const hour12 = hourNum % 12 || 12;
  return `${ampm} ${hour12}시 ${minute}분`;
}

/**
 * ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 * @param isoDate - ISO 8601 형식의 날짜 문자열
 * @returns 'YYYY-MM-DD' 형식의 문자열
 */
export function toDateString(isoDate: string | Date): string {
  return format(new Date(isoDate), 'yyyy-MM-dd');
}
