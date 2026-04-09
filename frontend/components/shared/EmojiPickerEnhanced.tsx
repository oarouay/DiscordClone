"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { useRecentEmojis } from "@/hooks/useRecentEmojis";

interface EmojiCategory {
  name: string;
  emojis: string[];
  icon: string;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Recent",
    emojis: [],
    icon: "🕐",
  },
  {
    name: "Smileys",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
    ],
    icon: "😀",
  },
  {
    name: "Nature",
    emojis: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐽",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐒",
    ],
    icon: "🌿",
  },
  {
    name: "Food",
    emojis: [
      "🍎",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
    ],
    icon: "🍎",
  },
  {
    name: "Objects",
    emojis: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎳",
      "🎯",
      "🎱",
      "🎮",
      "🎲",
      "🎰",
      "🧩",
      "♟️",
      "🎭",
      "🎨",
      "🎪",
    ],
    icon: "⚽",
  },
  {
    name: "Symbols",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "👍",
      "👎",
    ],
    icon: "❤️",
  },
];

interface EmojiPickerEnhancedProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
}

export function EmojiPickerEnhanced({
  onEmojiSelect,
  onClose,
}: EmojiPickerEnhancedProps) {
  const { recent, add } = useRecentEmojis();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  const categories: EmojiCategory[] = useMemo(() => {
    const updated = [...EMOJI_CATEGORIES];
    updated[0].emojis = recent;
    return updated;
  }, [recent]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const emojiNames: Record<string, string> = {
      "😀": "grinning face smile",
      "😃": "grinning face with big eyes",
      "😄": "grinning face with smiling eyes",
      "❤️": "red heart love",
      "😍": "heart eyes love",
      "🎉": "party celebration",
      "🎊": "confetti celebration",
    };

    const results: string[] = [];
    categories.forEach((cat) => {
      cat.emojis.forEach((emoji) => {
        const name = emojiNames[emoji] || "";
        if (name.includes(query)) {
          results.push(emoji);
        }
      });
    });

    return results;
  }, [searchQuery, categories]);

  const handleEmojiSelect = (emoji: string) => {
    add(emoji);
    onEmojiSelect(emoji);
  };

  const currentCategory = categories[activeCategory];
  const displayEmojis = searchQuery.trim() ? searchResults : currentCategory.emojis;

  return (
    <div className="emoji-picker-enhanced">
      <div className="emoji-picker-header">
        <div className="emoji-picker-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="emoji-picker-search-input"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="emoji-picker-search-clear"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="emoji-picker-close" title="Close">
            <X size={18} />
          </button>
        )}
      </div>

      {!searchQuery && (
        <div className="emoji-picker-categories">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`emoji-picker-category-btn ${activeCategory === idx ? "active" : ""}`}
              title={cat.name}
              aria-label={`${cat.name} category`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      <div className="emoji-picker-grid">
        {displayEmojis.length > 0 ? (
          displayEmojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => handleEmojiSelect(emoji)}
              className="emoji-picker-emoji"
              title={emoji}
              aria-label={`Select ${emoji}`}
            >
              {emoji}
            </button>
          ))
        ) : (
          <div className="emoji-picker-no-results">
            No emojis found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
