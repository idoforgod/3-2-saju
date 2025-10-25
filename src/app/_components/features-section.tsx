"use client";

import { Bot, Zap, BarChart3 } from "lucide-react";

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: <Bot className="w-12 h-12" />,
    title: "AI 기반 정밀 분석",
    description:
      "Google Gemini Pro가 천간·지지부터 대운까지 체계적으로 분석합니다",
  },
  {
    id: 2,
    icon: <Zap className="w-12 h-12" />,
    title: "즉시 확인 가능",
    description:
      "30초 이내에 마크다운 형식의 정리된 분석 결과를 받아보세요",
  },
  {
    id: 3,
    icon: <BarChart3 className="w-12 h-12" />,
    title: "체계적인 관리",
    description:
      "과거 분석 이력을 언제든지 다시 확인하고 비교할 수 있습니다",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
