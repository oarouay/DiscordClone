"use client";

import {
  Bold,
  Italic,
  Code,
  Eye,
  Trash2,
  Undo2,
  Redo2,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useMessageFormatting } from "@/hooks/useMessageFormatting";
import { useUndoRedo } from "@/hooks/useUndoRedo";

interface MessageFormattingToolbarProps {
  content: string;
  onContentChange: (content: string) => void;
  onClear?: () => void;
  maxLength?: number;
}

export function MessageFormattingToolbar({
  content,
  onContentChange,
  onClear,
  maxLength = 4000,
}: MessageFormattingToolbarProps) {
  const { bold, italic, strikethrough, code, codeBlock, quote } =
    useMessageFormatting(content, onContentChange);
  const { undo, redo, canUndo, canRedo } = useUndoRedo(content);

  const handleUndo = () => {
    // This is a simplified version - in a real app, you'd use the full undo/redo state
    if (canUndo) undo();
  };

  const handleRedo = () => {
    if (canRedo) redo();
  };

  const characterPercentage = (content.length / maxLength) * 100;
  const isNearLimit = characterPercentage > 80;

  return (
    <div className="message-formatting-toolbar">
      <div className="formatting-buttons">
        <button
          onClick={bold}
          className="format-btn"
          title="Bold (Cmd+B)"
          aria-label="Make text bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={italic}
          className="format-btn"
          title="Italic (Cmd+I)"
          aria-label="Make text italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={strikethrough}
          className="format-btn"
          title="Strikethrough"
          aria-label="Strike through text"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={code}
          className="format-btn"
          title="Inline Code"
          aria-label="Insert inline code"
        >
          <Code size={16} />
        </button>
        <button
          onClick={codeBlock}
          className="format-btn"
          title="Code Block"
          aria-label="Insert code block"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={quote}
          className="format-btn"
          title="Quote"
          aria-label="Insert quote"
        >
          <Quote size={16} />
        </button>

        <div className="formatting-divider" />

        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="format-btn"
          title="Undo"
          aria-label="Undo last action"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="format-btn"
          title="Redo"
          aria-label="Redo last action"
        >
          <Redo2 size={16} />
        </button>

        <div className="formatting-divider" />

        {onClear && (
          <button
            onClick={onClear}
            className="format-btn format-btn-danger"
            title="Clear message"
            aria-label="Clear message content"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className={`character-counter ${isNearLimit ? "near-limit" : ""}`}>
        {content.length}/{maxLength}
      </div>
    </div>
  );
}
