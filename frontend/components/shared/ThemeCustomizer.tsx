"use client";

import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import {
  useThemeCustomization,
  type FontSize,
  type Spacing,
} from "@/hooks/useThemeCustomization";

const ACCENT_PRESETS = [
  "#6c6fff",
  "#5865f2",
  "#5854d4",
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
  "#ef4444",
  "#14b8a6",
];

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const { customization, setAccentColor, setFontSize, setSpacing, reset } =
    useThemeCustomization();
  const [customColor, setCustomColor] = useState(customization.accentColor);

  if (!isOpen) return null;

  return (
    <div className="theme-customizer-overlay" onClick={onClose}>
      <div
        className="theme-customizer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="theme-customizer-header">
          <h2>Customize Theme</h2>
          <button
            onClick={onClose}
            className="theme-customizer-close"
            aria-label="Close customizer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="theme-customizer-content">
          {/* Accent Color */}
          <div className="customizer-section">
            <label className="customizer-label">Accent Color</label>
            <div className="accent-presets">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`accent-preset ${
                    customization.accentColor === color ? "active" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Set accent color to ${color}`}
                />
              ))}
            </div>

            <div className="custom-color-picker">
              <label htmlFor="customColor">Custom Color:</label>
              <div className="color-input-wrapper">
                <input
                  id="customColor"
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setAccentColor(e.target.value);
                  }}
                  className="color-input"
                />
                <span className="color-value">{customColor}</span>
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="customizer-section">
            <label className="customizer-label">Font Size</label>
            <div className="radio-group">
              {(["small", "normal", "large", "xlarge"] as FontSize[]).map(
                (size) => (
                  <label key={size} className="radio-item">
                    <input
                      type="radio"
                      name="fontSize"
                      value={size}
                      checked={customization.fontSize === size}
                      onChange={() => setFontSize(size)}
                    />
                    <span className="radio-label">
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Spacing */}
          <div className="customizer-section">
            <label className="customizer-label">Spacing</label>
            <div className="radio-group">
              {(["compact", "normal", "relaxed"] as Spacing[]).map((spacing) => (
                <label key={spacing} className="radio-item">
                  <input
                    type="radio"
                    name="spacing"
                    value={spacing}
                    checked={customization.spacing === spacing}
                    onChange={() => setSpacing(spacing)}
                  />
                  <span className="radio-label">
                    {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="theme-customizer-footer">
          <button
            onClick={reset}
            className="reset-btn"
            title="Reset to default theme"
          >
            <RotateCcw size={16} />
            Reset to Default
          </button>
          <button onClick={onClose} className="close-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
