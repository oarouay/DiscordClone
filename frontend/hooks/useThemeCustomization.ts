"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type FontSize = "small" | "normal" | "large" | "xlarge";
export type Spacing = "compact" | "normal" | "relaxed";

export interface ThemeCustomization {
  accentColor: string;
  fontSize: FontSize;
  spacing: Spacing;
}

const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  accentColor: "#6c6fff",
  fontSize: "normal",
  spacing: "normal",
};

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: "12px",
  normal: "16px",
  large: "18px",
  xlarge: "20px",
};

const SPACING_MAP: Record<Spacing, string> = {
  compact: "0.75",
  normal: "1",
  relaxed: "1.5",
};

export function useThemeCustomization() {
  const [customization, setCustomization] = useState<ThemeCustomization>(() => {
    try {
      const saved = localStorage.getItem("userTheme");
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });
  const isMountedRef = useRef(false);

  // Mark as mounted after first render
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // Apply customization to DOM
  useEffect(() => {
    if (!isMountedRef.current) return;

    const root = document.documentElement;
    root.style.setProperty("--accent", customization.accentColor);
    root.style.setProperty(
      "--accent-hover",
      adjustColorBrightness(customization.accentColor, -0.2)
    );
    root.style.setProperty(
      "--font-size-base",
      FONT_SIZE_MAP[customization.fontSize]
    );
    root.style.setProperty(
      "--spacing-multiplier",
      SPACING_MAP[customization.spacing]
    );

    // Save to localStorage
    localStorage.setItem("userTheme", JSON.stringify(customization));
  }, [customization]);

  const setAccentColor = useCallback((color: string) => {
    setCustomization((prev) => ({
      ...prev,
      accentColor: color,
    }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setCustomization((prev) => ({
      ...prev,
      fontSize,
    }));
  }, []);

  const setSpacing = useCallback((spacing: Spacing) => {
    setCustomization((prev) => ({
      ...prev,
      spacing,
    }));
  }, []);

  const reset = useCallback(() => {
    setCustomization(DEFAULT_CUSTOMIZATION);
  }, []);

  return {
    customization,
    setAccentColor,
    setFontSize,
    setSpacing,
    reset,
  };
}

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount * 255));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount * 255));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount * 255));
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}
