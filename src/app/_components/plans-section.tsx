"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  name: string;
  price: string;
  quota: string;
  model: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  ctaAction: () => void;
}

function PlanCard({
  name,
  price,
  quota,
  model,
  features,
  highlighted = false,
  badge,
  ctaText,
  ctaAction,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-2xl p-8 transition-all duration-300 animate-fade-in-up",
        highlighted
          ? "border-2 border-primary shadow-purple-2xl hover:scale-105"
          : "border border-border shadow-purple-md hover:shadow-purple-lg hover:-translate-y-1"
      )}
    >
      {/* 뱃지 (Pro만) */}
      {highlighted && badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-4 py-1.5 rounded-full gradient-purple text-white shadow-purple-lg text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>{badge}</span>
          </div>
        </div>
      )}

      {/* 플랜명 */}
      <div className="flex items-center gap-2 mb-4">
        {highlighted && <Zap className="w-6 h-6 text-warning fill-warning" />}
        <h3 className="text-2xl font-bold text-card-foreground">{name}</h3>
      </div>

      {/* 가격 */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-card-foreground">{price}</span>
          {price !== "무료" && (
            <span className="text-lg text-muted-foreground">/월</span>
          )}
        </div>
      </div>

      {/* 쿼터 정보 */}
      <div className="space-y-2 mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-lg">📅</span>
          <span className="font-medium">{quota}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-lg">🤖</span>
          <span className="font-medium">{model}</span>
        </div>
      </div>

      {/* 특징 목록 */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={cn(
              "mt-0.5 p-0.5 rounded-full",
              highlighted ? "bg-primary/10" : "bg-muted"
            )}>
              <Check className={cn(
                "w-4 h-4",
                highlighted ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-sm text-card-foreground flex-1">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA 버튼 */}
      <Button
        className={cn(
          "w-full transition-all duration-200",
          highlighted
            ? "gradient-purple text-white shadow-purple-lg hover:shadow-purple-xl hover:scale-105"
            : "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"
        )}
        size="lg"
        onClick={ctaAction}
      >
        {ctaText}
      </Button>
    </div>
  );
}

export function PlansSection() {
  const router = useRouter();

  const freePlan: PlanCardProps = {
    name: "무료 체험",
    price: "무료",
    quota: "총 3회 분석 가능",
    model: "Gemini 2.5 Flash",
    features: [
      "기본 사주팔자 분석",
      "천간·지지 계산",
      "오행 균형 분석",
      "마크다운 형식 결과",
      "분석 이력 조회",
    ],
    ctaText: "무료로 시작하기",
    ctaAction: () => router.push("/sign-in"),
  };

  const proPlan: PlanCardProps = {
    name: "Pro 구독",
    price: "₩9,900",
    quota: "매월 10회 분석",
    model: "Gemini 2.5 Pro",
    features: [
      "Free 플랜 모든 기능",
      "고급 AI 모델 (Gemini Pro)",
      "더 정교한 대운·세운 분석",
      "무제한 이력 저장",
      "우선 고객 지원",
      "프리미엄 분석 리포트",
    ],
    highlighted: true,
    badge: "인기",
    ctaText: "Pro로 시작하기",
    ctaAction: () => router.push("/sign-in"),
  };

  return (
    <section id="plans-section" className="py-16 sm:py-20 lg:py-24 gradient-purple-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            플랜을 <span className="text-gradient-purple">선택</span>하세요
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            무료로 체험해보고, 필요하면 Pro로 업그레이드하세요
          </p>
        </div>

        {/* 플랜 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          <div className="animation-delay-100">
            <PlanCard {...freePlan} />
          </div>
          <div className="animation-delay-200">
            <PlanCard {...proPlan} />
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 text-center animate-fade-in-up animation-delay-300">
          <p className="text-sm text-muted-foreground">
            💳 결제는 안전한 토스페이먼츠로 진행됩니다 · 언제든 구독 취소 가능
          </p>
        </div>
      </div>
    </section>
  );
}
