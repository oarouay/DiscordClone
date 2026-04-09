"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Check, X as XIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";
import { DMSidebar } from "@/components/dm/DMSidebar";
import { UserPanel } from "@/components/shared/UserPanel";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { dmApi } from "@/lib/dms";
import { friendsApi, type FriendResponse, type FriendRequestResponse } from "@/lib/friends";
import { FriendsPanel } from "@/components/dm/FriendsPanel";
import type { Message, User } from "@/types";

const MOCK_RICH_PRESENCE = { activity: "Playing Elden Ring", detail: "Exploring Limgrave • 2h 14m" };

export default function DirectMessagesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<User[]>([]);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestResponse[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshingSocial, setIsRefreshingSocial] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "pending" | "add">("friends");

  const { isConnected, authenticate } = useWebSocket({
    onMessage: (message: Message) => {
      // Just refresh conversations when new messages arrive
      const incomingUserId = message.channelId.replace("dm_", "");
      if (incomingUserId && !conversations.some(c => c.id === incomingUserId)) {
        refreshSocialData().catch(() => {});
      }
    },
  });

  useEffect(() => {
    if (isConnected && token) {
      authenticate(token);
    }
  }, [isConnected, token, authenticate]);

  const refreshSocialData = useCallback(async () => {
    setIsRefreshingSocial(true);
    try {
      const [conversationResponse, friendsList, incoming, outgoing] = await Promise.all([
        dmApi.listConversations(),
        friendsApi.listFriends(),
        friendsApi.listIncomingRequests(),
        friendsApi.listOutgoingRequests(),
      ]);

      setConversations(conversationResponse.map((item) => item.user));
      setFriends(friendsList);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } finally {
      setIsRefreshingSocial(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshSocialData().catch(() => {
      setConversations([]);
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
    });
  }, [user, refreshSocialData]);

  useEffect(() => {
    const normalized = searchValue.trim();
    if (normalized.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      friendsApi.searchUsers(normalized)
        .then((results) => setSearchResults(results))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchValue]);

  const handleSendFriendRequest = async (targetUserId: string) => {
    await friendsApi.sendRequest(targetUserId);
    await refreshSocialData();
  };

  const handleAcceptRequest = async (requestId: string) => {
    await friendsApi.acceptRequest(requestId);
    await refreshSocialData();
  };

  const handleDeclineRequest = async (requestId: string) => {
    await friendsApi.declineRequest(requestId);
    await refreshSocialData();
  };

  const bottomSlot = user ? (
    <UserPanel
      user={user}
      richPresence={MOCK_RICH_PRESENCE}
      isMuted={isMuted}
      isDeafened={isDeafened}
      onToggleMute={() => setIsMuted((m) => !m)}
      onToggleDeafen={() => setIsDeafened((d) => !d)}
      onLogout={() => {}}
      onSave={(updates) => { Object.assign(user, updates); }}
    />
  ) : null;

  const outgoingTargetIds = new Set(outgoingRequests.map(r => r.receiver.id));
  const totalPending = incomingRequests.length + outgoingRequests.length;

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
      <DMSidebar
        conversations={conversations}
        onSelectUser={(id) => router.push(`/channels/me/${id}`)}
        isConnected={isConnected}
        topSlot={
          <FriendsPanel
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            searchResults={searchResults}
            isSearching={isSearching}
            outgoingRequests={outgoingRequests}
            incomingRequests={incomingRequests}
            onSendRequest={handleSendFriendRequest}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            isBusy={isRefreshingSocial}
          />
        }
        bottomSlot={bottomSlot}
      />

      {/* Main friends panel content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-primary)" }}>
        {/* Tabs header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("friends")}
            style={{
              padding: "8px 16px",
              background: activeTab === "friends" ? "var(--accent)" : "transparent",
              border: "none",
              color: activeTab === "friends" ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: "6px",
              transition: "all 0.2s",
            }}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "8px 16px",
              background: activeTab === "pending" ? "var(--accent)" : "transparent",
              border: "none",
              color: activeTab === "pending" ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: "6px",
              transition: "all 0.2s",
            }}
          >
            Pending {totalPending > 0 && `(${totalPending})`}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            style={{
              padding: "8px 16px",
              background: activeTab === "add" ? "var(--accent)" : "transparent",
              border: "none",
              color: activeTab === "add" ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: "6px",
              transition: "all 0.2s",
            }}
          >
            <UserPlus size={16} style={{ display: "inline", marginRight: "4px" }} />
            Add Friend
          </button>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {activeTab === "friends" ? (
            friends.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: "40px" }}>
                <p>No friends yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {friends.map((friend) => (
                  <div
                    key={friend.user.id}
                    onClick={() => router.push(`/channels/me/${friend.user.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "var(--bg-hover)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
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
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                            onClick={() => handleAcceptRequest(request.id)}
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
                            onClick={() => handleDeclineRequest(request.id)}
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
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: "40px" }}>
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
                    searchResults.map((searchUser) => {
                      const alreadyRequested = outgoingTargetIds.has(searchUser.id);
                      return (
                        <div
                          key={searchUser.id}
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
                              background: `hsl(${(searchUser.username.charCodeAt(0) * 7) % 360}, 70%, 50%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {searchUser.displayName[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                              {searchUser.displayName}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              @{searchUser.username}
                            </div>
                          </div>
                          <button
                            onClick={() => handleSendFriendRequest(searchUser.id)}
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
                <div style={{ textAlign: "center", color: "var(--text-muted)", paddingTop: "40px" }}>
                  <p>Search for a username or email to add a friend</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <VoiceControls
        isMuted={isMuted}
        isDeafened={isDeafened}
        onToggleMute={() => setIsMuted((m) => !m)}
        onToggleDeafen={() => setIsDeafened((d) => !d)}
        onLeave={() => {}}
      />
    </div>
  );
}