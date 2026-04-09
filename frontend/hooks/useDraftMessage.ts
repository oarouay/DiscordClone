"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { saveDraft, loadDraft, clearDraft } from "@/lib/drafts";

export function useDraftMessage(channelId: string) {
  const [content, setContent] = useState(() => loadDraft(channelId) || "");
  const [saved, setSaved] = useState(false);
  const isMountedRef = useRef(false);

  // Mark as mounted after first render
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!isMountedRef.current) return;

    const timer = setTimeout(() => {
      if (content.trim()) {
        const success = saveDraft(channelId, content);
        if (success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [content, channelId]);

  const clear = useCallback(() => {
    clearDraft(channelId);
    setContent("");
    setSaved(false);
  }, [channelId]);

  return {
    content,
    setContent,
    saved,
    clear,
  };
}
