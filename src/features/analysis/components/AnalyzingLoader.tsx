'use client';

import { useState, useEffect } from 'react';

export function AnalyzingLoader() {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // 프로그레스 바 애니메이션 (30초 기준)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / 30; // 1초당 3.33% 증가
      });
    }, 1000);

    // 경과 시간 카운터
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          {/* 회전 스피너 */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            AI가 사주를 분석하고 있습니다
          </h3>
          <p className="text-gray-600 mb-6">
            약 30초 소요됩니다. 잠시만 기다려주세요.
          </p>

          {/* 프로그레스 바 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-sm text-gray-500">
            경과 시간: {elapsedTime}초 / 예상 30초
          </p>
        </div>
      </div>
    </div>
  );
}
