import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";

export const metadata: Metadata = {
  title: "사주풀이 - AI가 풀어주는 당신만의 사주 이야기",
  description:
    "Google Gemini AI로 정밀한 사주팔자 분석. 무료 체험 3회 제공. 천간·지지, 오행, 대운·세운을 체계적으로 분석합니다.",
  keywords: ["사주", "사주풀이", "AI 사주", "무료 사주", "사주팔자", "운세"],
  openGraph: {
    title: "사주풀이 - AI가 풀어주는 당신만의 사주 이야기",
    description: "Google Gemini AI로 정밀한 사주팔자 분석. 무료 체험 3회 제공.",
    type: "website",
    locale: "ko_KR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <CurrentUserProvider initialState={currentUser}>
            {children}
          </CurrentUserProvider>
        </Providers>
      </body>
    </html>
  );
}
