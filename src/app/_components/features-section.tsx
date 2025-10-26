"use client";

import { Clock, Bot, DollarSign, BarChart3 } from "lucide-react";

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: <Clock className="w-12 h-12" />,
    title: "⏱️ 즉시 분석",
    description:
      "30초 이내에 결과를 제공합니다. 긴 대기 시간 없이 바로 확인하세요",
  },
  {
    id: 2,
    icon: <Bot className="w-12 h-12" />,
    title: "🤖 Gemini AI 기반",
    description:
      "Google Gemini AI가 전문 상담사 수준의 정밀한 사주팔자 분석을 제공합니다",
  },
  {
    id: 3,
    icon: <DollarSign className="w-12 h-12" />,
    title: "💰 합리적인 가격",
    description:
      "무료 체험 3회 제공, 이후 월 9,900원으로 매월 10회 분석을 이용하세요",
  },
  {
    id: 4,
    icon: <BarChart3 className="w-12 h-12" />,
    title: "📊 분석 이력 보관",
    description:
      "과거 분석 이력을 무제한 조회할 수 있습니다. 언제든 다시 확인하세요",
  },
];

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="mb-4 text-purple-600">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-base leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            왜 사주풀이인가요?
          </h2>
          <p className="text-base leading-relaxed text-gray-600">
            전문가 수준의 AI 분석으로 정확하고 깊이 있는 사주 해석을 제공합니다
          </p>
        </div>

        {/* 특징 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
