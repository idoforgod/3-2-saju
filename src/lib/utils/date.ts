import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko });
}

export function formatTime(time: string): string {
  const [hour, minute] = time.split(':');
  const ampm = parseInt(hour) >= 12 ? '오후' : '오전';
  const hour12 = parseInt(hour) % 12 || 12;
  return ampm + ' ' + hour12 + '시 ' + minute + '분';
}
