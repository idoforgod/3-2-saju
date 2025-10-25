"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  name: string;
  price: string;
  quota: string;
  model: string;
  features: string[];
  highlighted?: boolean;
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
  ctaText,
  ctaAction,
}: PlanCardProps) {
  return (
    <div
      className={cn(
        "border rounded-xl p-8 shadow-md transition-all duration-300",
        highlighted
          ? "border-2 border-purple-600 bg-white shadow-xl hover:shadow-2xl"
          : "border-gray-200 bg-white hover:shadow-lg"
      )}
    >
      {/* 플랜명 */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>

      {/* 가격 */}
      <div className="mb-4">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        {price !== "무료" && <span className="text-gray-600">/월</span>}
      </div>

      {/* 쿼터 정보 */}
      <p className="text-sm text-gray-600 mb-2">📅 {quota}</p>
      <p className="text-sm text-gray-600 mb-6">🤖 {model}</p>

      {/* 특징 목록 */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">✓</span>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA 버튼 */}
      <Button
        className={cn(
          "w-full transition-all duration-200",
          highlighted
            ? "bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:shadow-xl"
            : "border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-600 hover:text-white"
        )}
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
    ],
    ctaText: "무료로 시작하기",
    ctaAction: () => router.push("/login"),
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
    ],
    highlighted: true,
    ctaText: "Pro로 시작하기",
    ctaAction: () => router.push("/login"),
  };

  return (
    <section id="plans-section" className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            플랜을 선택하세요
          </h2>
          <p className="text-base leading-relaxed text-gray-600">
            무료로 체험해보고, 필요하면 Pro로 업그레이드하세요
          </p>
        </div>

        {/* 플랜 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlanCard {...freePlan} />
          <PlanCard {...proPlan} />
        </div>
      </div>
    </section>
  );
}
