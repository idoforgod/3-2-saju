"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const router = useRouter();

  const handleScrollToPlans = () => {
    const plansSection = document.getElementById("plans-section");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center">
          {/* 메인 헤딩 */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            AI가 풀어주는
            <br />
            당신만의 사주 이야기
          </h1>

          {/* 서브 헤딩 */}
          <p className="text-lg leading-relaxed text-gray-700 mb-8 max-w-2xl mx-auto">
            Google Gemini AI가 20년 경력 사주 전문가의 통찰력으로
            <br />
            당신의 사주팔자를 정밀하게 분석합니다.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-purple-600 text-white shadow-lg hover:shadow-xl hover:bg-purple-700 transition-all duration-200"
              onClick={() => router.push("/sign-in")}
            >
              무료로 시작하기 (3회 무료)
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200"
              onClick={handleScrollToPlans}
            >
              Pro 플랜 알아보기
            </Button>
          </div>

          {/* 신뢰도 지표 */}
          <p className="mt-6 text-sm text-gray-500">
            ✨ 이미 1,000명이 사주풀이를 경험했습니다
          </p>
        </div>
      </div>
    </section>
  );
}
