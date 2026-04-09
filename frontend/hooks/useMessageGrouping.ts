"use client";

import { useMemo } from "react";

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface MessageGroup {
  userId: string;
  firstMessage: Message;
  messages: Message[];
  groupedAt: number;
}

const GROUP_TIME_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_GROUP_SIZE = 50; // Max messages to group (prevents huge groups)

/**
 * Hooks that groups consecutive messages from the same user within a 5-minute window
 * @param messages - Array of messages to group
 * @returns Array of message groups
 */
export function useMessageGrouping(messages: Message[]): MessageGroup[] {
  return useMemo(() => {
    if (!messages.length) return [];

    const groups: MessageGroup[] = [];
    let currentGroup: Message[] = [];
    let lastUserId: string | null = null;
    let lastTimestamp: number = 0;

    for (const message of messages) {
      const timeSinceLastMessage = message.timestamp - lastTimestamp;
      const isSameUser = message.userId === lastUserId;
      const withinTimeWindow = timeSinceLastMessage <= GROUP_TIME_WINDOW;
      const canAddToGroup =
        isSameUser && withinTimeWindow && currentGroup.length < MAX_GROUP_SIZE;

      if (canAddToGroup && currentGroup.length > 0) {
        // Add to current group
        currentGroup.push(message);
      } else {
        // Start a new group
        if (currentGroup.length > 0) {
          // Save the previous group
          groups.push({
            userId: lastUserId!,
            firstMessage: currentGroup[0],
            messages: currentGroup,
            groupedAt: currentGroup[0].timestamp,
          });
        }

        currentGroup = [message];
        lastUserId = message.userId;
      }

      lastTimestamp = message.timestamp;
    }

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push({
        userId: lastUserId!,
        firstMessage: currentGroup[0],
        messages: currentGroup,
        groupedAt: currentGroup[0].timestamp,
      });
    }

    return groups;
  }, [messages]);
}

/**
 * Utility function to format timestamp for message groups
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatGroupTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = (now.getTime() - timestamp) / (1000 * 60);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60)
    return `${Math.floor(diffMinutes)}m ago`;

  const diffHours = (now.getTime() - timestamp) / (1000 * 60 * 60);
  if (diffHours < 24) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (diffHours < 48) return "yesterday";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

/**
 * Utility function to check if a group should show as collapsed
 * @param group - The message group
 * @returns Boolean indicating if group should be collapsed
 */
export function shouldCollapseGroup(group: MessageGroup): boolean {
  return group.messages.length > 5;
}
