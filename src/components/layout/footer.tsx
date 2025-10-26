export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">사주풀이</h3>
            <p className="text-sm text-gray-600">
              AI 기반 즉시 사주 상담 서비스
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>무료 체험</li>
              <li>Pro 구독</li>
              <li>이용 가이드</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">정보</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>이용약관</li>
              <li>개인정보처리방침</li>
              <li>고객센터</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2025 사주풀이. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
