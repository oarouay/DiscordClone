"use client";

import { X, UserPlus, Check, X as XIcon, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { friendsApi, type FriendRequestResponse, type FriendResponse } from "@/lib/friends";
import type { User } from "@/types";

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsModal({ isOpen, onClose }: FriendsModalProps) {
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestResponse[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "pending" | "add">("friends");

  // Load friends and requests when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [f, i, o] = await Promise.all([
          friendsApi.listFriends(),
          friendsApi.listIncomingRequests(),
          friendsApi.listOutgoingRequests(),
        ]);
        setFriends(f);
        setIncomingRequests(i);
        setOutgoingRequests(o);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  // Search when search value changes
  useEffect(() => {
    const normalized = searchValue.trim();
    if (normalized.length < 2) {
      if (searchResults.length > 0) setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      friendsApi.searchUsers(normalized)
        .then((results) => setSearchResults(results))
        .catch(() => setSearchResults([]));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchResults.length]);

  const handleAccept = async (requestId: string) => {
    try {
      await friendsApi.acceptRequest(requestId);
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Failed to accept request", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await friendsApi.declineRequest(requestId);
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Failed to decline request", error);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      await friendsApi.sendRequest(targetUserId);
      setSearchResults(prev => prev.filter(u => u.id !== targetUserId));
    } catch (error) {
      console.error("Failed to send request", error);
    }
  };

  if (!isOpen) return null;

  const totalPending = incomingRequests.length + outgoingRequests.length;
  const outgoingTargetIds = new Set(outgoingRequests.map(r => r.receiver.id));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-primary)",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "540px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            Friends
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            padding: "0 8px",
            gap: "4px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("friends")}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: activeTab === "friends" ? "var(--accent)" : "transparent",
              border: "none",
              color: activeTab === "friends" ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s",
            }}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: activeTab === "pending" ? "var(--accent)" : "transparent",
              border: "none",
              color: activeTab === "pending" ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s",
            }}
          >
            Pending {totalPending > 0 && `(${totalPending})`}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: activeTab === "add" ? "var(--accent)" : "transparent",
              border: "none",
              color: activeTab === "add" ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s",
            }}
          >
            <UserPlus size={16} style={{ display: "inline", marginRight: "4px" }} />
            Add
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
          ) : activeTab === "friends" ? (
            friends.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 16px" }}>
                <p>No friends yet. Add someone!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {friends.map((friend) => (
                  <div
                    key={friend.user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "var(--bg-hover)",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: `hsl(${(friend.user.username.charCodeAt(0) * 7) % 360}, 70%, 50%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {friend.user.displayName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                        {friend.user.displayName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        @{friend.user.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "pending" ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {incomingRequests.length > 0 && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Incoming ({incomingRequests.length})
                  </h3>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {incomingRequests.map((request) => (
                      <div
                        key={request.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          background: "var(--bg-hover)",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `hsl(${(request.requester.username.charCodeAt(0) * 7) % 360}, 70%, 50%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {request.requester.displayName[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                            {request.requester.displayName}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            @{request.requester.username}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button
                            onClick={() => handleAccept(request.id)}
                            style={{
                              background: "var(--success)",
                              border: "none",
                              borderRadius: "50%",
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#fff",
                            }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleDecline(request.id)}
                            style={{
                              background: "var(--danger)",
                              border: "none",
                              borderRadius: "50%",
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              color: "#fff",
                            }}
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Outgoing ({outgoingRequests.length})
                  </h3>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {outgoingRequests.map((request) => (
                      <div
                        key={request.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          background: "var(--bg-hover)",
                          borderRadius: "8px",
                          opacity: 0.7,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `hsl(${(request.receiver.username.charCodeAt(0) * 7) % 360}, 70%, 50%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {request.receiver.displayName[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                            {request.receiver.displayName}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            @{request.receiver.username}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", flexShrink: 0 }}>
                          <Clock size={16} />
                          <span style={{ fontSize: 12 }}>Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 16px" }}>
                  <p>No pending requests</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by username or email..."
                style={{
                  padding: "12px",
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              />

              {searchValue.trim().length >= 2 && (
                <div style={{ display: "grid", gap: "8px" }}>
                  {searchResults.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
                      No users found
                    </div>
                  ) : (
                    searchResults.map((user) => {
                      const alreadyRequested = outgoingTargetIds.has(user.id);
                      return (
                        <div
                          key={user.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px",
                            background: "var(--bg-hover)",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: `hsl(${(user.username.charCodeAt(0) * 7) % 360}, 70%, 50%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {user.displayName[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                              {user.displayName}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              @{user.username}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSendRequest(user.id)}
                            disabled={alreadyRequested}
                            style={{
                              padding: "8px 12px",
                              background: alreadyRequested ? "var(--bg-secondary)" : "var(--accent)",
                              color: alreadyRequested ? "var(--text-muted)" : "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: alreadyRequested ? "default" : "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                              transition: "all 0.2s",
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

              {searchValue.trim().length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 16px" }}>
                  <p>Search for a username or email to add a friend</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
