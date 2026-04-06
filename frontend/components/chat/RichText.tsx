"use client";

import { Fragment } from "react";
import { emojiMap } from "@/lib/mock";

interface RichTextProps {
  content: string;
}

export function RichText({ content }: RichTextProps) {
  const urlRegex = /https?:\/\/[^\s]+/g;

  // First, detect URLs and split content around them
  const urlMatches = Array.from(content.matchAll(urlRegex));
  const parts: (string | { type: "url"; value: string })[] = [];

  let lastIndex = 0;
  urlMatches.forEach((match) => {
    if (match.index! > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ type: "url", value: match[0] });
    lastIndex = match.index! + match[0].length;
  });

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (typeof part === "string") {
          return <EmojiText key={idx} text={part} />;
        }
        if (part.type === "url") {
          return (
            <Fragment key={idx}>
              <a
                href={part.value}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--link, #0a8cc9)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                aria-label={`Link: ${part.value}`}
              >
                {part.value}
              </a>
            </Fragment>
          );
        }
        return null;
      })}
    </>
  );
}

function EmojiText({ text }: { text: string }) {
  const emojiRegex = /:([a-z0-9_+-]+):/g;
  const parts: (string | { type: "emoji"; value: string; name: string })[] = [];

  const matches = Array.from(text.matchAll(emojiRegex));
  let lastIndex = 0;

  matches.forEach((match) => {
    const name = match[1];
    const shortcode = match[0];
    const emoji = emojiMap[shortcode];

    if (match.index! > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (emoji) {
      parts.push({ type: "emoji", value: emoji, name });
    } else {
      parts.push(shortcode);
    }

    lastIndex = match.index! + match[0].length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    return text;
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (typeof part === "string") {
          return <Fragment key={idx}>{part}</Fragment>;
        }
        if (part.type === "emoji") {
          return (
            <span
              key={idx}
              className="emoji"
              role="img"
              aria-label={part.name}
              style={{
                fontSize: "1.2em",
                display: "inline-block",
                marginLeft: "0.1em",
                marginRight: "0.1em",
              }}
            >
              {part.value}
            </span>
          );
        }
        return null;
      })}
    </>
  );
}
