'use client';

import Link from 'next/link';

/**
 * 전역 푸터 컴포넌트
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 섹션 */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-4">사주풀이</h3>
            <p className="text-sm text-gray-600">
              AI 기반 사주팔자 분석 서비스
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              바로가기
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-purple-600"
                >
                  내 분석
                </Link>
              </li>
              <li>
                <Link
                  href="/analysis/new"
                  className="text-sm text-gray-600 hover:text-purple-600"
                >
                  새 분석하기
                </Link>
              </li>
              <li>
                <Link
                  href="/subscription"
                  className="text-sm text-gray-600 hover:text-purple-600"
                >
                  구독 관리
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              서비스 정보
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                무료 플랜: 3회 분석
              </li>
              <li className="text-sm text-gray-600">
                Pro 플랜: 월 10회 분석 (9,900원)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} 사주풀이. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
