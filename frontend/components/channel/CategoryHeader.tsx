"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreVertical, Trash2, Plus } from "lucide-react";
import { useMockData } from "@/context/MockDataProvider";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  childCount?: number;
}

export function CategoryHeader({
  categoryId,
  categoryName,
  isCollapsed = false,
  onCollapsedChange,
  childCount = 0,
}: CategoryHeaderProps) {
  const mockData = useMockData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggleCollapse = () => {
    mockData.toggleCategoryCollapse(categoryId);
    onCollapsedChange?.(!isCollapsed);
  };

  const handleDeleteCategory = () => {
    // In a real app, you'd delete the category and its channels from the backend
    setToastMessage("Category deleted.");
    setTimeout(() => setToastMessage(""), 3000);
    setShowDeleteConfirm(false);
    setIsMenuOpen(false);
  };

  const handleCreateCategory = () => {
    // Placeholder for creating a new category
    setToastMessage("New category created. (Feature in progress)");
    setTimeout(() => setToastMessage(""), 3000);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const actuallyCollapsed = mockData.isCategoryCollapsed(categoryId);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 8px",
          cursor: "pointer",
          userSelect: "none",
          borderRadius: "4px",
          transition: "background 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-hover, rgba(255,255,255,0.08))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Collapse arrow */}
        <button
          onClick={handleToggleCollapse}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted, #72767d)",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            transition: "transform 0.2s",
            transform: actuallyCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          }}
          aria-label={actuallyCollapsed ? `Expand ${categoryName}` : `Collapse ${categoryName}`}
          aria-expanded={!actuallyCollapsed}
        >
          <ChevronDown size={16} />
        </button>

        {/* Category name */}
        <span
          onClick={handleToggleCollapse}
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-muted, #72767d)",
            transition: "color 0.2s",
          }}
        >
          {categoryName}
        </span>

        {/* Channel count */}
        {childCount > 0 && (
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted, #72767d)",
              marginRight: 4,
            }}
          >
            {childCount}
          </span>
        )}

        {/* Menu button */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted, #72767d)",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.parentElement?.parentElement?.style.setProperty(
                "opacity",
                "1",
                "important"
              );
            }}
            aria-label={`Menu for ${categoryName}`}
            aria-expanded={isMenuOpen}
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 4,
                background: "var(--bg-secondary, rgba(255,255,255,0.05))",
                border: "1px solid var(--border, rgba(255,255,255,0.1))",
                borderRadius: "6px",
                minWidth: "160px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                zIndex: 1000,
              }}
              role="menu"
            >
              <MenuItem
                onClick={handleToggleCollapse}
                label={actuallyCollapsed ? "Expand" : "Collapse"}
              />
              <MenuItem onClick={handleCreateCategory} label="Create Category" icon={<Plus size={14} />} />
              <MenuItem
                onClick={() => setShowDeleteConfirm(true)}
                label="Delete"
                icon={<Trash2 size={14} />}
                danger={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--bg-secondary, rgba(255,255,255,0.05))",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: "8px",
            padding: "20px",
            minWidth: "300px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 1001,
          }}
          role="alertdialog"
        >
          <p style={{ margin: "0 0 16px 0", color: "var(--text-primary, #fff)" }}>
            Delete {categoryName} and all its channels? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDeleteCategory}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "var(--error, #ed4245)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "var(--bg-hover, rgba(255,255,255,0.1))",
                color: "var(--text-primary, #fff)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            background: "var(--success, #23a55a)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "4px",
            zIndex: 1002,
          }}
          role="status"
        >
          {toastMessage}
        </div>
      )}

      {/* Mouse enter effect for menu button */}
      <div
        onMouseEnter={(e) => {
          const menuBtn = e.currentTarget.querySelector("[aria-label*='Menu']") as HTMLElement;
          if (menuBtn) menuBtn.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          const menuBtn = e.currentTarget.querySelector("[aria-label*='Menu']") as HTMLElement;
          if (menuBtn && !isMenuOpen) menuBtn.style.opacity = "0";
        }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
    </>
  );
}

function MenuItem({
  onClick,
  label,
  icon,
  danger = false,
}: {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 12px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: danger ? "var(--error, #ed4245)" : "var(--text-primary, #fff)",
        fontSize: 13,
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover, rgba(255,255,255,0.15))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
