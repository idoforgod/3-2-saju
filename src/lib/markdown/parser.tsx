'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 마크다운 렌더러 컴포넌트
 * Gemini API 응답(마크다운)을 안전하게 HTML로 변환
 * XSS 방지를 위해 rehype-sanitize 플러그인 사용
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-purple max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        components={{
        h1: ({ children, ...props }) => (
          <h1
            className="text-3xl font-bold mb-4 text-gray-900"
            {...props}
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2
            className="text-2xl font-semibold mb-3 text-gray-800"
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            className="text-xl font-semibold mb-2 text-gray-700"
            {...props}
          >
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p
            className="mb-4 leading-relaxed text-gray-700"
            {...props}
          >
            {children}
          </p>
        ),
        ul: ({ children, ...props }) => (
          <ul
            className="list-disc list-inside mb-4 space-y-2"
            {...props}
          >
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol
            className="list-decimal list-inside mb-4 space-y-2"
            {...props}
          >
            {children}
          </ol>
        ),
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-purple-700" {...props}>
            {children}
          </strong>
        ),
        em: ({ children, ...props }) => (
          <em className="italic text-purple-600" {...props}>
            {children}
          </em>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
