"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Star } from "lucide-react";

export function HeroSection() {
  const router = useRouter();

  const handleScrollToPlans = () => {
    const plansSection = document.getElementById("plans-section");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden gradient-purple-subtle">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow animation-delay-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
        <div className="text-center">
          {/* 뱃지 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-purple-md mb-8 animate-fade-in-down">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="text-sm font-semibold text-foreground">
              이미 1,000명이 사주풀이를 경험했습니다
            </span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>

          {/* 메인 헤딩 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up animation-delay-100">
            AI가 풀어주는
            <br />
            <span className="text-gradient-purple">
              당신만의 사주 이야기
            </span>
          </h1>

          {/* 서브 헤딩 */}
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Google Gemini AI가 20년 경력 사주 전문가의 통찰력으로
            <br className="hidden sm:block" />
            당신의 사주팔자를 정밀하게 분석합니다.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
            <Button
              size="lg"
              className="group bg-primary text-primary-foreground shadow-purple-lg hover:shadow-purple-xl hover:scale-105 transition-all duration-200 min-w-[200px]"
              onClick={() => router.push("/sign-in")}
            >
              <span>무료로 시작하기</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 min-w-[200px]"
              onClick={handleScrollToPlans}
            >
              Pro 플랜 알아보기
            </Button>
          </div>

          {/* 특징 배지 */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-12 animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-medium">3회 무료 체험</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse animation-delay-100" />
              <span className="font-medium">30초 즉시 분석</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse animation-delay-200" />
              <span className="font-medium">무제한 이력 조회</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
