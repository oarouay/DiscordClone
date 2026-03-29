"use client";

import { useState, useRef, useEffect } from "react";
import type { HSVColor, RGBColor } from "@/lib/colorConversion";
import { hexToHSV, hsvToHEX, hexToRGB, rgbToHEX, hsvToRGB, rgbToHSV } from "@/lib/colorConversion";

interface ColorPickerProps {
  /** Initial color in HEX format (e.g., "#FF5733") */
  initialColor?: string;
  /** Called when color changes (returns HEX) */
  onChange?: (color: string) => void;
  /** Show HSV or RGB mode by default */
  defaultMode?: "hsv" | "rgb";
}

/**
 * A colour picker component supporting HSV and RGB input modes.
 * Returns HEX to parent. Includes mode toggle.
 */
export function ColorPicker({ initialColor = "#6C6FFF", onChange, defaultMode = "hsv" }: ColorPickerProps) {
  const [hex, setHex] = useState(initialColor);
  const [mode, setMode] = useState<"hsv" | "rgb">(defaultMode);
  const [hsv, setHsv] = useState(() => hexToHSV(initialColor));
  const [rgb, setRgb] = useState(() => hexToRGB(initialColor));

  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const svCanvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw hue slider
  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let x = 0; x < canvas.width; x++) {
      const hue = (x / canvas.width) * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, 0, 1, canvas.height);
    }
  }, []);

  // Redraw S-V canvas when hue changes
  useEffect(() => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const s = (x / canvas.width) * 100;
        const v = 100 - (y / canvas.height) * 100;

        const rgb = hsvToRGB({ h: hsv.h, s, v });
        const idx = (y * canvas.width + x) * 4;
        data[idx] = rgb.r;
        data[idx + 1] = rgb.g;
        data[idx + 2] = rgb.b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [hsv.h]);

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHsv = { ...hsv, h: parseInt(e.target.value, 10) };
    setHsv(newHsv);
    const newHex = hsvToHEX(newHsv);
    setHex(newHex);
    setRgb(hsvToRGB(newHsv));
    onChange?.(newHex);
  };

  const handleSVCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = Math.max(0, Math.min(100, (x / canvas.width) * 100));
    const v = Math.max(0, Math.min(100, 100 - (y / canvas.height) * 100));

    const newHsv = { ...hsv, s: Math.round(s), v: Math.round(v) };
    setHsv(newHsv);
    const newHex = hsvToHEX(newHsv);
    setHex(newHex);
    setRgb(hsvToRGB(newHsv));
    onChange?.(newHex);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#")) val = "#" + val;

    setHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const newHsv = hexToHSV(val);
      setHsv(newHsv);
      setRgb(hexToRGB(val));
      onChange?.(val);
    }
  };

  const handleRgbChange = (channel: "r" | "g" | "b", value: string) => {
    const num = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
    const newRgb = { ...rgb, [channel]: num };
    setRgb(newRgb);
    const newHex = rgbToHEX(newRgb);
    setHex(newHex);
    setHsv(rgbToHSV(newRgb));
    onChange?.(newHex);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius)" }}>
      {/* ── Mode Toggle ── */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setMode("hsv")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 4,
            border: "1px solid var(--border)",
            backgroundColor: mode === "hsv" ? "var(--accent)" : "var(--bg-secondary)",
            color: mode === "hsv" ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            transition: "background-color 0.2s, color 0.2s",
          }}
          aria-label="HSV mode"
        >
          HSV
        </button>
        <button
          onClick={() => setMode("rgb")}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 4,
            border: "1px solid var(--border)",
            backgroundColor: mode === "rgb" ? "var(--accent)" : "var(--bg-secondary)",
            color: mode === "rgb" ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            transition: "background-color 0.2s, color 0.2s",
          }}
          aria-label="RGB mode"
        >
          RGB
        </button>
      </div>

      {/* ── HSV Mode ── */}
      {mode === "hsv" && (
        <>
          {/* S-V Canvas */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Saturation & Value
            </label>
            <canvas
              ref={svCanvasRef}
              width={200}
              height={140}
              onClick={handleSVCanvasClick}
              style={{
                width: "100%",
                height: 140,
                cursor: "crosshair",
                borderRadius: 4,
                border: "1px solid var(--border)",
              }}
              aria-label="Saturation and value selector"
            />
          </div>

          {/* Hue Slider */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
              Hue
            </label>
            <canvas
              ref={hueCanvasRef}
              width={200}
              height={20}
              style={{
                width: "100%",
                height: 20,
                borderRadius: 4,
                border: "1px solid var(--border)",
                marginBottom: 8,
                display: "block",
              }}
              aria-label="Hue selector"
            />
            <input
              type="range"
              min="0"
              max="360"
              value={hsv.h}
              onChange={handleHueChange}
              style={{ width: "100%", cursor: "pointer" }}
              aria-label="Hue value"
            />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              H: {hsv.h}° | S: {hsv.s}% | V: {hsv.v}%
            </div>
          </div>
        </>
      )}

      {/* ── RGB Mode ── */}
      {mode === "rgb" && (
        <>
          {["r", "g", "b"].map((channel) => (
            <div key={channel}>
              <label
                style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}
                htmlFor={`rgb-${channel}`}
              >
                {channel.toUpperCase()}
              </label>
              <input
                id={`rgb-${channel}`}
                type="number"
                min="0"
                max="255"
                value={rgb[channel as keyof RGBColor]}
                onChange={(e) => handleRgbChange(channel as "r" | "g" | "b", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </>
      )}

      {/* ── HEX Input ── */}
      <div>
        <label
          style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}
          htmlFor="hex-input"
        >
          HEX
        </label>
        <input
          id="hex-input"
          type="text"
          value={hex}
          onChange={handleHexInput}
          placeholder="#000000"
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 13,
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* ── Preview ── */}
      <div
        style={{
          width: "100%",
          height: 60,
          borderRadius: 4,
          backgroundColor: hex,
          border: "1px solid var(--border)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
        }}
        aria-label={`Colour preview: ${hex}`}
      />
    </div>
  );
}
