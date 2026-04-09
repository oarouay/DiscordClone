"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="markdown-h1" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="markdown-h2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="markdown-h3" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="markdown-bold" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="markdown-italic" {...props} />
          ),
          // @ts-expect-error - react-markdown inline prop is not properly typed
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="markdown-code-inline" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <pre className="markdown-code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ ...props }) => (
            <blockquote className="markdown-blockquote" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="markdown-ul" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="markdown-ol" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="markdown-li" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="markdown-link"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          del: ({ ...props }) => (
            <del className="markdown-strikethrough" {...props} />
          ),
          table: ({ ...props }) => (
            <table className="markdown-table" {...props} />
          ),
          thead: ({ ...props }) => (
            <thead className="markdown-thead" {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className="markdown-tbody" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr className="markdown-tr" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="markdown-td" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="markdown-th" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
