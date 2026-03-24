"use client";

import { useState } from "react";
import { formatFileSize } from "./FilePreview";
import type { Attachment } from "@/types";

type Props = {
  attachments: Attachment[];
};

export function MessageAttachments({ attachments }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="message-attachments">
      {attachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: Attachment }) {
  const [imageError, setImageError] = useState(false);
  const isImage = attachment.mimeType.startsWith("image/") && !imageError;

  if (isImage) {
    return (
      <div className="attachment-image-wrapper">
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="attachment-image"
          onError={() => setImageError(true)}
        />
        <a
          href={attachment.url}
          download={attachment.filename}
          className="attachment-download-overlay"
          title="Download"
        >
          ↓
        </a>
      </div>
    );
  }

  return (
    <a
      href={attachment.url}
      download={attachment.filename}
      className="attachment-file"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="attachment-file-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="attachment-file-info">
        <p className="attachment-file-name">{attachment.filename}</p>
        <p className="attachment-file-size">{formatFileSize(attachment.size)}</p>
      </div>
      <div className="attachment-file-download" title="Download">↓</div>
    </a>
  );
}