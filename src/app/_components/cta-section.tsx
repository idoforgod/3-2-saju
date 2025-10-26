"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* 그라데이션 배경 */}
      <div className="absolute inset-0 gradient-purple opacity-95" />

      {/* 배경 패턴 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 relative text-center">
        {/* 아이콘 */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm mb-8 animate-scale-in">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        {/* 헤딩 */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in-up animation-delay-100">
          지금 바로 시작하세요
        </h2>

        {/* 설명 */}
        <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          무료 체험 3회로 AI 사주 분석의 정확성을 직접 경험해보세요.
          <br className="hidden sm:block" />
          카드 등록 없이 즉시 시작할 수 있습니다.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
          <Button
            size="lg"
            className="group bg-white text-primary hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-200 min-w-[200px]"
            onClick={() => router.push("/sign-in")}
          >
            <span className="font-semibold">무료로 시작하기</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>

        {/* 추가 정보 */}
        <p className="mt-8 text-sm text-white/70 animate-fade-in-up animation-delay-400">
          ✓ 신용카드 불필요 · ✓ 즉시 시작 가능 · ✓ 언제든 업그레이드 가능
        </p>
      </div>
    </section>
  );
}
