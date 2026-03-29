import type { Message } from "@/types";

/**
 * Flags a message to show/hide its header (avatar + name).
 * A header is shown only for the first message in a group.
 * 
 * Group break occurs when:
 * - Different user sends a message, OR
 * - More than 5 minutes pass between messages from the same user
 */
export interface GroupedMessage extends Message {
  showHeader: boolean;
}

/**
 * Compute grouping for consecutive messages.
 * Returns messages with a `showHeader` boolean flag.
 */
export function computeMessageGrouping(messages: Message[]): GroupedMessage[] {
  if (messages.length === 0) return [];

  const FIVE_MINUTES_MS = 5 * 60 * 1000;
  const result: GroupedMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const current = messages[i];
    const previous = i > 0 ? messages[i - 1] : null;

    let showHeader = true;

    if (previous) {
      const sameAuthor = current.author.id === previous.author.id;
      const currentTime = new Date(current.createdAt).getTime();
      const previousTime = new Date(previous.createdAt).getTime();
      const timeDiff = currentTime - previousTime;

      // Break group if different author OR too much time passed
      if (sameAuthor && timeDiff <= FIVE_MINUTES_MS) {
        showHeader = false;
      }
    }

    result.push({
      ...current,
      showHeader,
    });
  }

  return result;
}
