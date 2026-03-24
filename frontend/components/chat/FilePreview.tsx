"use client";

import { useEffect, useState } from "react";

const MAX_SIZE = 10 * 1024 * 1024;

type PendingFile = {
  file: File;
  previewUrl: string | null;
};

type Props = {
  files: PendingFile[];
  onRemove: (index: number) => void;
};

export function FilePreview({ files, onRemove }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="file-preview-bar">
      {files.map((pending, index) => (
        <div key={index} className="file-preview-item">
          {pending.previewUrl ? (
            <img
              src={pending.previewUrl}
              alt={pending.file.name}
              className="file-preview-image"
            />
          ) : (
            <div className="file-preview-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          )}
          <div className="file-preview-info">
            <p className="file-preview-name">{pending.file.name}</p>
            <p className="file-preview-size">{formatFileSize(pending.file.size)}</p>
          </div>
          <button
            className="file-preview-remove"
            onClick={() => onRemove(index)}
            title="Remove file"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFiles(incoming: File[], existing: File[]): { valid: File[]; errors: string[] } {
  const errors: string[] = [];
  const valid: File[] = [];

  for (const file of incoming) {
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name} exceeds the 10 MB limit.`);
      continue;
    }
    const duplicate = existing.some((f) => f.name === file.name && f.size === file.size);
    if (duplicate) {
      errors.push(`${file.name} is already attached.`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
}

export function createPendingFiles(files: File[]): PendingFile[] {
  return files.map((file) => ({
    file,
    previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
  }));
}

export function revokePreviews(pending: PendingFile[]): void {
  pending.forEach((p) => {
    if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
  });
}