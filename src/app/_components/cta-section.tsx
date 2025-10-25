"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-16 bg-purple-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold text-white mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-lg text-purple-100 mb-8">
          Google 계정으로 간편하게 가입하고 무료 분석 3회를 받아보세요
        </p>
        <Button
          size="lg"
          className="bg-white text-purple-600 shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-200"
          onClick={() => router.push("/login")}
        >
          무료로 시작하기
        </Button>
      </div>
    </section>
  );
}
