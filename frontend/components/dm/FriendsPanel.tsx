"use client";

import { useMemo } from "react";
import type { User } from "@/types";
import type { FriendRequestResponse } from "@/lib/friends";

type FriendsPanelProps = {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchResults: User[];
  isSearching?: boolean;
  friendRequestError?: string;
  outgoingRequests: FriendRequestResponse[];
  incomingRequests: FriendRequestResponse[];
  onSendRequest: (targetUserId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  isBusy?: boolean;
};

export function FriendsPanel({
  searchValue,
  onSearchValueChange,
  searchResults,
  isSearching = false,
  friendRequestError = "",
  outgoingRequests,
  incomingRequests,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  isBusy = false,
}: FriendsPanelProps) {
  const outgoingTargetIds = useMemo(
    () => new Set(outgoingRequests.map((request) => request.receiver.id)),
    [outgoingRequests]
  );

  const showResults = searchValue.trim().length > 0;

  return (
    <div style={{ padding: "10px 10px 8px", borderBottom: "1px solid var(--border)", display: "grid", gap: 8 }}>
      <input
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
        placeholder="Find by username or email"
        aria-label="Search users"
        style={{ fontSize: 12, padding: "8px 10px" }}
      />

      {showResults && (
        <div style={{ maxHeight: 140, overflowY: "auto", display: "grid", gap: 6 }}>
          {isSearching ? (
            <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 2px" }}>
              Searching…
            </p>
          ) : searchResults.length === 0 ? (
            <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 2px" }}>
              No users found.
            </p>
          ) : (
            searchResults.map((user) => {
              const alreadyRequested = outgoingTargetIds.has(user.id);
              return (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    background: "var(--bg-hover)",
                    borderRadius: 6,
                    padding: "6px 8px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.displayName}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      @{user.username}
                    </p>
                  </div>
                  <button
                    onClick={() => onSendRequest(user.id)}
                    disabled={alreadyRequested || isBusy}
                    style={{
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: alreadyRequested || isBusy ? "not-allowed" : "pointer",
                      background: alreadyRequested ? "var(--bg-secondary)" : "var(--accent)",
                      color: alreadyRequested ? "var(--text-muted)" : "#fff",
                    }}
                  >
                    {alreadyRequested ? "Sent" : "Add"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {friendRequestError && (
        <p style={{ fontSize: 11, color: "var(--danger)", padding: "2px 2px" }}>
          {friendRequestError}
        </p>
      )}

      <div style={{ display: "grid", gap: 6 }}>
        <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Incoming Requests
        </p>
        {incomingRequests.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>No pending requests.</p>
        ) : (
          incomingRequests.map((request) => (
            <div key={request.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {request.requester.displayName}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => onAcceptRequest(request.id)}
                  disabled={isBusy}
                  style={{ border: "none", borderRadius: 5, padding: "4px 6px", fontSize: 10, background: "var(--success)", color: "#fff", cursor: "pointer" }}
                >
                  Accept
                </button>
                <button
                  onClick={() => onDeclineRequest(request.id)}
                  disabled={isBusy}
                  style={{ border: "none", borderRadius: 5, padding: "4px 6px", fontSize: 10, background: "var(--danger)", color: "#fff", cursor: "pointer" }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}