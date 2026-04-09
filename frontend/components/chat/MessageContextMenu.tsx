"use client";

import { Copy, Pin, Trash2, MessageSquare, Smile } from "lucide-react";
import type { Message } from "@/types";

interface MessageContextMenuProps {
  message: Message;
  position: { x: number; y: number } | null;
  isOwnMessage: boolean;
  onCopy: (message: Message) => void;
  onCopyAsCodeBlock: (message: Message) => void;
  onCopyId: (message: Message) => void;
  onPin?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onQuote?: (message: Message) => void;
  onReact?: (message: Message) => void;
  menuRef?: React.RefObject<HTMLDivElement>;
}

export function MessageContextMenu({
  message,
  position,
  isOwnMessage,
  onCopy,
  onCopyAsCodeBlock,
  onCopyId,
  onPin,
  onDelete,
  onQuote,
  onReact,
  menuRef,
}: MessageContextMenuProps) {
  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="message-context-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="menu"
      aria-label="Message actions"
    >
      <button
        className="message-context-menu-item"
        onClick={() => onCopy(message)}
        title="Copy message text"
      >
        <Copy size={16} />
        Copy Text
      </button>

      <button
        className="message-context-menu-item"
        onClick={() => onCopyAsCodeBlock(message)}
        title="Copy as code block"
      >
        <Copy size={16} />
        Copy as Code Block
      </button>

      <button
        className="message-context-menu-item"
        onClick={() => onCopyId(message)}
        title="Copy message ID"
      >
        <Copy size={16} />
        Copy ID
      </button>

      <div className="message-context-menu-divider" />

      {onQuote && (
        <button
          className="message-context-menu-item"
          onClick={() => onQuote(message)}
          title="Quote message in reply"
        >
          <MessageSquare size={16} />
          Quote
        </button>
      )}

      {onReact && (
        <button
          className="message-context-menu-item"
          onClick={() => onReact(message)}
          title="Add reaction to message"
        >
          <Smile size={16} />
          React
        </button>
      )}

      {onPin && (
        <button
          className="message-context-menu-item"
          onClick={() => onPin(message)}
          title="Pin message"
        >
          <Pin size={16} />
          Pin
        </button>
      )}

      {isOwnMessage && onDelete && (
        <>
          <div className="message-context-menu-divider" />
          <button
            className="message-context-menu-item message-context-menu-item-danger"
            onClick={() => onDelete(message.id)}
            title="Delete message"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </>
      )}
    </div>
  );
}
