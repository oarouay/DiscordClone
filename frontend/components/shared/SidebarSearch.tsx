"use client";

import { X, Search } from "lucide-react";
import { useSidebarSearch } from "@/hooks/useSidebarSearch";

interface SidebarSearchProps<T extends { id: string; name: string }> {
  items: T[];
  onSelect?: (item: T) => void;
  placeholder?: string;
}

export function SidebarSearch<T extends { id: string; name: string }>({
  items,
  onSelect,
  placeholder = "Search...",
}: SidebarSearchProps<T>) {
  const { query, setQuery, results, clear, hasNoResults } =
    useSidebarSearch(items);

  return (
    <div className="sidebar-search-container">
      <div className="sidebar-search-input-wrapper">
        <Search size={16} className="sidebar-search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sidebar-search-input"
          aria-label="Search sidebar items"
        />
        {query && (
          <button
            onClick={clear}
            className="sidebar-search-clear"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {query && (
        <div className="sidebar-search-results">
          {hasNoResults ? (
            <div className="sidebar-search-no-results">No results found</div>
          ) : (
            <div className="sidebar-search-list">
              {results.map((item) => (
                <button
                  key={item.id}
                  className="sidebar-search-result-item"
                  onClick={() => {
                    onSelect?.(item);
                    clear();
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
