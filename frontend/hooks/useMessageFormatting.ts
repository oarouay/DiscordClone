"use client";

import { useCallback } from "react";

export function useMessageFormatting(text: string, setText: (text: string) => void) {
  const insertMarkdown = useCallback(
    (before: string, after: string = "") => {
      const textarea = document.activeElement as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = text.substring(start, end) || "text";

      const newText =
        text.substring(0, start) +
        before +
        selectedText +
        after +
        text.substring(end);

      setText(newText);

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selectedText.length;
        textarea.focus();
      }, 0);
    },
    [text, setText]
  );

  const bold = useCallback(() => insertMarkdown("**", "**"), [insertMarkdown]);
  const italic = useCallback(() => insertMarkdown("*", "*"), [insertMarkdown]);
  const strikethrough = useCallback(
    () => insertMarkdown("~~", "~~"),
    [insertMarkdown]
  );
  const code = useCallback(
    () => insertMarkdown("`", "`"),
    [insertMarkdown]
  );
  const codeBlock = useCallback(
    () => insertMarkdown("```\n", "\n```"),
    [insertMarkdown]
  );
  const quote = useCallback(
    () => insertMarkdown("> "),
    [insertMarkdown]
  );

  return {
    bold,
    italic,
    strikethrough,
    code,
    codeBlock,
    quote,
  };
}
