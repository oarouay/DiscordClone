/**
 * HSV ↔ HEX color conversion utilities.
 * Pure functions - no external dependencies.
 */

/** HSV color object (0-360°, 0-100%, 0-100%) */
export interface HSVColor {
  h: number; // hue: 0-360
  s: number; // saturation: 0-100
  v: number; // value/brightness: 0-100
}

/** RGB color object (0-255, 0-255, 0-255) */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert HEX string to HSV.
 * Input: "#RRGGBB" or "RRGGBB"
 * Output: { h: 0-360, s: 0-100, v: 0-100 }
 */
export function hexToHSV(hex: string): HSVColor {
  let h6 = hex.replace(/^#/, "");
  if (h6.length === 3) {
    h6 = h6
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(h6.substring(0, 2), 16) / 255;
  const g = parseInt(h6.substring(2, 4), 16) / 255;
  const b = parseInt(h6.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / delta + 2) * 60;
    else h = ((r - g) / delta + 4) * 60;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

/**
 * Convert HSV to HEX.
 * Input: { h: 0-360, s: 0-100, v: 0-100 }
 * Output: "#RRGGBB"
 */
export function hsvToHEX(hsv: HSVColor): string {
  const h = hsv.h / 60;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 1) {
    r = c;
    g = x;
  } else if (h >= 1 && h < 2) {
    r = x;
    g = c;
  } else if (h >= 2 && h < 3) {
    g = c;
    b = x;
  } else if (h >= 3 && h < 4) {
    g = x;
    b = c;
  } else if (h >= 4 && h < 5) {
    r = x;
    b = c;
  } else if (h >= 5 && h < 6) {
    r = c;
    b = x;
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HEX to RGB.
 * Input: "#RRGGBB" or "RRGGBB"
 * Output: { r, g, b }
 */
export function hexToRGB(hex: string): RGBColor {
  let h6 = hex.replace(/^#/, "");
  if (h6.length === 3) {
    h6 = h6
      .split("")
      .map((c) => c + c)
      .join("");
  }

  return {
    r: parseInt(h6.substring(0, 2), 16),
    g: parseInt(h6.substring(2, 4), 16),
    b: parseInt(h6.substring(4, 6), 16),
  };
}

/**
 * Convert RGB to HEX.
 * Input: { r: 0-255, g: 0-255, b: 0-255 }
 * Output: "#RRGGBB"
 */
export function rgbToHEX(rgb: RGBColor): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSV.
 */
export function rgbToHSV(rgb: RGBColor): HSVColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / delta + 2) * 60;
    else h = ((r - g) / delta + 4) * 60;
  }

  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

/**
 * Convert HSV to RGB.
 */
export function hsvToRGB(hsv: HSVColor): RGBColor {
  const h = hsv.h / 60;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 1) {
    r = c;
    g = x;
  } else if (h >= 1 && h < 2) {
    r = x;
    g = c;
  } else if (h >= 2 && h < 3) {
    g = c;
    b = x;
  } else if (h >= 3 && h < 4) {
    g = x;
    b = c;
  } else if (h >= 4 && h < 5) {
    r = x;
    b = c;
  } else if (h >= 5 && h < 6) {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}
