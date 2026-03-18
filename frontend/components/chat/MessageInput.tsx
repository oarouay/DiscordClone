"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  channelName: string;
  isDisabled?: boolean;
  onSend?: (content: string) => void;
}

export default function MessageInput({ channelName, isDisabled = false, onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || isDisabled) return;

    setIsLoading(true);
    
    // TODO: Replace with API call to send message
    try {
      if (onSend) {
        onSend(content);
      }
      setContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-6 pb-6 pt-6 border-t border-bg-secondary">
      <div className="flex gap-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || isLoading}
          placeholder={isDisabled ? "💡 Chat coming in Commit 7" : `Message #${channelName}`}
          className="flex-1 bg-input border border-input rounded-lg px-5 py-4 text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed max-h-96 text-base"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isDisabled || isLoading}
          className="self-end"
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
