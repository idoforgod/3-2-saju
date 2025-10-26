import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

export function Loading({ message = '로딩 중...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

export function FullPageLoading({ message = '로딩 중...' }: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message={message} />
    </div>
  );
}
