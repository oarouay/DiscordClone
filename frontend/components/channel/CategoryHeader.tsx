"use client";

import { ChevronDown } from "lucide-react";
import { useMockData } from "@/context/MockDataProvider";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  childCount?: number;
}

export function CategoryHeader({
  categoryId,
  categoryName,
  childCount = 0,
}: CategoryHeaderProps) {
  const mockData = useMockData();
  const isCollapsed = mockData.isCategoryCollapsed(categoryId);

  const handleToggle = () => {
    mockData.toggleCategoryCollapse(categoryId);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "8px 12px",
        background: "transparent",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        color: "var(--text-muted)",
        userSelect: "none",
        transition: "background 0.15s",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      aria-label={isCollapsed ? `Expand ${categoryName}` : `Collapse ${categoryName}`}
      aria-expanded={!isCollapsed}
    >
      <ChevronDown
        size={14}
        style={{
          flexShrink: 0,
          transition: "transform 0.15s",
          transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
        }}
      />
      <span style={{ flex: 1, textAlign: "left" }}>{categoryName}</span>
      {childCount > 0 && <span style={{ fontSize: 11 }}>{childCount}</span>}
    </button>
  );
}
