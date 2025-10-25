'use client';

import { TossPaymentWidget } from './toss-payment-widget';

export default function TerminatedView() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">구독 해지됨</h1>
          <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            해지됨
          </span>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <span className="text-red-600 text-2xl">❌</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                구독이 해지되었습니다
              </h2>
              <p className="text-gray-700">
                분석 서비스를 이용하려면 다시 구독해주세요.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-1">남은 분석 횟수</p>
          <p className="text-4xl font-bold text-gray-400">0회</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">안내 사항</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                분석 서비스를 이용하려면 다시 구독해주세요
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                재구독 시 결제 정보를 다시 입력해야 합니다
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">•</span>
              <p className="text-gray-700 flex-1">
                기존 분석 이력은 계속 확인할 수 있습니다
              </p>
            </div>
          </div>
        </div>

        <TossPaymentWidget />
      </div>
    </div>
  );
}
