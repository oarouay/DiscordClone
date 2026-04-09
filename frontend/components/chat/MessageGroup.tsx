"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MessageGroup, Message } from "@/hooks/useMessageGrouping";
import { formatGroupTime, shouldCollapseGroup } from "@/hooks/useMessageGrouping";

interface MessageGroupProps {
  group: MessageGroup;
  renderMessage: (message: Message, isGrouped: boolean) => React.ReactNode;
  onShowMore?: (groupId: string) => void;
}

/**
 * MessageGroup component displays grouped messages with collapse/expand
 * Shows the first message with avatar and name, subsequent messages are compact
 */
export function MessageGroupComponent({
  group,
  renderMessage,
  onShowMore,
}: MessageGroupProps) {
  const [isExpanded, setIsExpanded] = useState(!shouldCollapseGroup(group));
  const canCollapse = shouldCollapseGroup(group);
  const visibleMessages = isExpanded ? group.messages : group.messages.slice(0, 1);
  const hiddenCount = group.messages.length - visibleMessages.length;

  return (
    <div className="message-group" data-user-id={group.userId}>
      {/* First message with avatar and name */}
      <div className="message-group-header">
        {renderMessage(group.firstMessage, false)}
        <span className="group-time">{formatGroupTime(group.groupedAt)}</span>
      </div>

      {/* Collapsed state indicator */}
      {canCollapse && !isExpanded && hiddenCount > 0 && (
        <div className="message-group-collapsed-indicator">
          <button
            onClick={() => setIsExpanded(true)}
            onMouseEnter={() => onShowMore?.(group.userId)}
            className="expand-btn"
            aria-label={`Show ${hiddenCount} more message${hiddenCount !== 1 ? "s" : ""}`}
          >
            <ChevronDown size={16} />
            <span>{hiddenCount} more message{hiddenCount !== 1 ? "s" : ""}</span>
          </button>
        </div>
      )}

      {/* Remaining messages - compact display */}
      <div className={`message-group-messages ${isExpanded ? "expanded" : ""}`}>
        {group.messages.slice(1).map((message) => (
          <div key={message.id} className="grouped-message">
            {renderMessage(message, true)}
          </div>
        ))}
      </div>

      {/* Collapse indicator */}
      {canCollapse && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="collapse-btn"
          aria-label="Collapse message group"
        >
          <ChevronUp size={14} />
          <span>Collapse</span>
        </button>
      )}
    </div>
  );
}
