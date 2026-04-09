"use client";

const DRAFT_PREFIX = "draft_";
const DRAFT_EXPIRY_DAYS = 30;
const MAX_DRAFT_SIZE = 10240; // 10KB

interface DraftData {
  content: string;
  timestamp: number;
}

export function saveDraft(channelId: string, content: string): boolean {
  try {
    // Check size limit
    if (content.length > MAX_DRAFT_SIZE) {
      console.warn("Draft exceeds max size, truncating...");
      return false;
    }

    const draftData: DraftData = {
      content,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      `${DRAFT_PREFIX}${channelId}`,
      JSON.stringify(draftData)
    );
    return true;
  } catch (error) {
    console.error("Failed to save draft:", error);
    return false;
  }
}

export function loadDraft(channelId: string): string | null {
  try {
    const stored = localStorage.getItem(`${DRAFT_PREFIX}${channelId}`);
    if (!stored) return null;

    const draftData: DraftData = JSON.parse(stored);
    const now = Date.now();
    const ageInDays = (now - draftData.timestamp) / (1000 * 60 * 60 * 24);

    // Check if draft has expired
    if (ageInDays > DRAFT_EXPIRY_DAYS) {
      clearDraft(channelId);
      return null;
    }

    return draftData.content;
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}

export function clearDraft(channelId: string): void {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${channelId}`);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}

export function getAllDrafts(): Record<string, string> {
  const drafts: Record<string, string> = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_PREFIX)) {
        const channelId = key.replace(DRAFT_PREFIX, "");
        const content = loadDraft(channelId);
        if (content) {
          drafts[channelId] = content;
        }
      }
    }
  } catch (error) {
    console.error("Failed to get all drafts:", error);
  }

  return drafts;
}

export function clearExpiredDrafts(): void {
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const draftData: DraftData = JSON.parse(stored);
            const ageInDays =
              (now - draftData.timestamp) / (1000 * 60 * 60 * 24);
            if (ageInDays > DRAFT_EXPIRY_DAYS) {
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to clear expired drafts:", error);
  }
}
