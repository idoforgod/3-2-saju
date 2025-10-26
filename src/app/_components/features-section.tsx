"use client";

import { Clock, Bot, DollarSign, BarChart3 } from "lucide-react";

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: <Clock className="w-10 h-10 sm:w-12 sm:h-12" />,
    title: "즉시 분석",
    description:
      "30초 이내에 결과를 제공합니다. 긴 대기 시간 없이 바로 확인하세요",
    color: "text-accent",
  },
  {
    id: 2,
    icon: <Bot className="w-10 h-10 sm:w-12 sm:h-12" />,
    title: "Gemini AI 기반",
    description:
      "Google Gemini AI가 전문 상담사 수준의 정밀한 사주팔자 분석을 제공합니다",
    color: "text-primary",
  },
  {
    id: 3,
    icon: <DollarSign className="w-10 h-10 sm:w-12 sm:h-12" />,
    title: "합리적인 가격",
    description:
      "무료 체험 3회 제공, 이후 월 9,900원으로 매월 10회 분석을 이용하세요",
    color: "text-success",
  },
  {
    id: 4,
    icon: <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" />,
    title: "분석 이력 보관",
    description:
      "과거 분석 이력을 무제한 조회할 수 있습니다. 언제든 다시 확인하세요",
    color: "text-secondary",
  },
];

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  index: number;
}

function FeatureCard({ icon, title, description, color, index }: FeatureCardProps) {
  const animationDelay = `animation-delay-${(index + 1) * 100}`;

  return (
    <div
      className={`group relative bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-purple-md hover:shadow-purple-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up ${animationDelay}`}
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 아이콘 */}
      <div className={`relative mb-4 sm:mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      {/* 제목 */}
      <h3 className="relative text-lg sm:text-xl font-bold text-card-foreground mb-2 sm:mb-3">
        {title}
      </h3>

      {/* 설명 */}
      <p className="relative text-sm sm:text-base leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* 호버 장식 */}
      <div className={`absolute bottom-0 left-0 w-0 h-1 ${color.replace('text-', 'bg-')} rounded-full group-hover:w-full transition-all duration-300`} />
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-in-up">
            왜 <span className="text-gradient-purple">사주풀이</span>인가요?
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            전문가 수준의 AI 분석으로 정확하고 깊이 있는 사주 해석을 제공합니다
          </p>
        </div>

        {/* 특징 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
