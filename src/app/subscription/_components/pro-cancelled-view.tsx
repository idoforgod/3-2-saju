'use client';

import { formatDate } from '@/lib/utils/date';
import { SubscriptionActions } from './subscription-actions';

interface ProCancelledViewProps {
  quota: number;
  nextPaymentDate: string;
  cancelledAt: string;
}

export default function ProCancelledView({
  quota,
  nextPaymentDate,
  cancelledAt,
}: ProCancelledViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">구독 취소 예정</h1>
          <span className="px-4 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
            취소 예정
          </span>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <span className="text-orange-600 text-2xl">⚠️</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                구독이 취소되었습니다
              </h2>
              <p className="text-gray-700">
                {formatDate(nextPaymentDate)}까지 Pro 기능을 계속 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">남은 횟수</p>
            <p className="text-3xl font-bold text-purple-600">{quota}회</p>
            <p className="text-xs text-gray-500 mt-1">종료일까지 사용 가능</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">종료 예정일</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatDate(nextPaymentDate)}
            </p>
            <p className="text-xs text-gray-500 mt-1">무료 플랜으로 전환</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">안내 사항</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                {formatDate(nextPaymentDate)}까지 Pro 기능을 계속 사용할 수 있습니다
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                종료일 이후 무료 플랜으로 자동 전환됩니다
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                종료일 전까지 언제든지 재활성화할 수 있습니다
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                취소 요청: {formatDate(cancelledAt)}
              </p>
            </div>
          </div>
        </div>

        <SubscriptionActions status="cancelled" nextPaymentDate={nextPaymentDate} />
      </div>
    </div>
  );
}
