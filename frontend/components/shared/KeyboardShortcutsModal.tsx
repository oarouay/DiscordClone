"use client";

import { X } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsProps) {
  const { shortcuts, getShortcutDisplay } = useKeyboardShortcuts();

  if (!isOpen) return null;

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div
        className="keyboard-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="keyboard-shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="keyboard-shortcuts-close"
            aria-label="Close keyboard shortcuts"
          >
            <X size={20} />
          </button>
        </div>

        <div className="keyboard-shortcuts-content">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="shortcut-item">
              <div className="shortcut-keys">
                <kbd className="shortcut-key">
                  {getShortcutDisplay(shortcut)}
                </kbd>
              </div>
              <div className="shortcut-description">
                {shortcut.description}
              </div>
            </div>
          ))}
        </div>

        <div className="keyboard-shortcuts-footer">
          <p>Press <kbd>ESC</kbd> to close shortcuts menu</p>
        </div>
      </div>
    </div>
  );
}
