'use client';

import { formatDate } from '@/lib/utils/date';
import { SubscriptionActions } from './subscription-actions';

interface ProActiveViewProps {
  quota: number;
  nextPaymentDate: string;
  lastPaymentDate: string;
}

export default function ProActiveView({
  quota,
  nextPaymentDate,
  lastPaymentDate,
}: ProActiveViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pro 플랜 활성</h1>
          <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            활성
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">남은 횟수</p>
            <p className="text-3xl font-bold text-purple-600">{quota}회</p>
            <p className="text-xs text-gray-500 mt-1">/ 월 10회</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">다음 결제일</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatDate(nextPaymentDate)}
            </p>
            <p className="text-xs text-gray-500 mt-1">자동 결제</p>
          </div>

          <div className="bg-pink-50 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-1">결제 금액</p>
            <p className="text-3xl font-bold text-gray-900">9,900원</p>
            <p className="text-xs text-gray-500 mt-1">월 구독</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">구독 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">플랜</span>
              <span className="font-semibold text-gray-900">Pro 플랜</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상태</span>
              <span className="font-semibold text-green-600">활성</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">마지막 결제</span>
              <span className="font-semibold text-gray-900">
                {formatDate(lastPaymentDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="font-semibold text-gray-900">월 9,900원</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-yellow-600 text-xl">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                구독을 취소해도 다음 결제일까지 Pro 기능을 계속 사용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <SubscriptionActions status="active" nextPaymentDate={nextPaymentDate} />
      </div>
    </div>
  );
}
