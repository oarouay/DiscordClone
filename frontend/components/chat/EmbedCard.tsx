"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { getEmbed } from "@/lib/mock";

interface EmbedCardProps {
  url: string;
}

export function EmbedCard({ url }: EmbedCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const embed = getEmbed(url);

  if (!embed) {
    return null;
  }

  return (
    <div
      style={{
        display: "block",
        marginTop: 8,
        marginBottom: 8,
        maxWidth: "432px",
        borderLeft: `4px solid ${embed.color}`,
        borderRadius: "4px",
        background: "var(--bg-secondary, rgba(255,255,255,0.05))",
        overflow: "hidden",
      }}
      role="region"
      aria-label={`Embed for ${embed.title}`}
    >
      {!isCollapsed && (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Header with collapse button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted, #999)",
                  marginBottom: 4,
                  fontWeight: 500,
                }}
              >
                {embed.siteName}
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--link, #0a8cc9)",
                  textDecoration: "none",
                  wordBreak: "break-word",
                  cursor: "pointer",
                }}
              >
                {embed.title}
              </a>
            </div>

            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted, #999)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary, #fff)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted, #999)";
              }}
              aria-label="Collapse embed"
            >
              <ChevronUp size={16} />
            </button>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary, #ccc)",
              margin: 0,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {embed.description}
          </p>

          {/* Image if present */}
          {embed.image && (
            <Image
              src={embed.image}
              alt={embed.title}
              width={400}
              height={200}
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "4px",
                marginTop: 8,
                maxHeight: 300,
                objectFit: "cover",
              }}
            />
          )}
        </div>
      )}

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted, #999)",
            fontSize: 12,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary, #fff)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted, #999)";
          }}
          aria-label={`Expand embed for ${embed.title}`}
        >
          <ChevronUp size={14} style={{ transform: "rotate(180deg)" }} />
          <span>{embed.title}</span>
        </button>
      )}
    </div>
  );
}
