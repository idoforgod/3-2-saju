'use client';

import { TossPaymentWidget } from './toss-payment-widget';

interface FreeSubscriptionViewProps {
  quota: number;
}

export default function FreeSubscriptionView({ quota }: FreeSubscriptionViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">무료 플랜</h1>

        <div className="bg-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">남은 분석 횟수</p>
              <p className="text-4xl font-bold text-purple-600">{quota}회</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">✓</span>
            <span className="text-gray-700">사주 분석 3회 제공</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">✓</span>
            <span className="text-gray-700">Gemini Flash 모델 사용</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">✓</span>
            <span className="text-gray-700">분석 이력 무제한 저장</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Pro 플랜 소개</h2>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <p className="font-semibold">월 10회 분석 가능</p>
              <p className="text-purple-100 text-sm">무제한 분석으로 더 깊이 있는 이해</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <p className="font-semibold">Gemini Pro 모델 사용</p>
              <p className="text-purple-100 text-sm">더욱 정교하고 상세한 분석 결과</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <p className="font-semibold">상세한 대운/세운 해석</p>
              <p className="text-purple-100 text-sm">운세 변화의 흐름을 정확히 파악</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <p className="font-semibold">월 9,900원 (부가세 포함)</p>
              <p className="text-purple-100 text-sm">합리적인 가격으로 프리미엄 서비스 이용</p>
            </div>
          </div>
        </div>

        <TossPaymentWidget />
      </div>
    </div>
  );
}
