"use client";

import { useLinkPreview } from "@/hooks/useLinkPreview";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  url: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const { preview, loading } = useLinkPreview(url);

  if (loading) {
    return (
      <div className="link-preview">
        <div className="link-preview-loading">Loading preview...</div>
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="link-preview"
      title={preview.title || url}
    >
      <div className="link-preview-content">
        {preview.favicon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.favicon}
            alt=""
            className="link-preview-favicon"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="link-preview-info">
          <div className="link-preview-title">
            {preview.title || new URL(url).hostname}
          </div>
          {preview.description && (
            <div className="link-preview-description">
              {preview.description}
            </div>
          )}
          <div className="link-preview-url">
            <ExternalLink size={12} />
            {new URL(url).hostname}
          </div>
        </div>
      </div>
    </a>
  );
}

interface LinkPreviewsProps {
  content: string;
  maxPreviews?: number;
}

export function LinkPreviews({
  content,
  maxPreviews = 3,
}: LinkPreviewsProps) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = Array.from(content.matchAll(urlRegex)).slice(0, maxPreviews);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="link-previews-container">
      {matches.map((match, idx) => (
        <LinkPreview key={idx} url={match[0]} />
      ))}
    </div>
  );
}
