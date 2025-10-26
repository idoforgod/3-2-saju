"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "./_components/hero-section";
import { FeaturesSection } from "./_components/features-section";
import { PlansSection } from "./_components/plans-section";
import { CTASection } from "./_components/cta-section";

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // 로그인 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // 로딩 중이거나 로그인 사용자는 아무것도 표시하지 않음
  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <HeroSection />
        <FeaturesSection />
        <PlansSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
