"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";
import { useDMContext } from "@/context/DMContext";
import { useMessagesCache } from "@/context/MessagesCache";
import { DMSidebar } from "@/components/dm/DMSidebar";
import { UserPanel } from "@/components/shared/UserPanel";
import { VoiceControls } from "@/components/voice/VoiceControls";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/types";
import { dmApi } from "@/lib/dms";
import { friendsApi } from "@/lib/friends";
import { FriendsPanel } from "@/components/dm/FriendsPanel";
import type { User as CallingUser } from "@/types/calling";
import { useGlobalVoiceCall } from "@/context/GlobalVoiceCallContext";

const MOCK_RICH_PRESENCE = { activity: "Playing Elden Ring", detail: "Exploring Limgrave • 2h 14m" };

export default function DirectMessagePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { user, token, logout } = useAuth();
  
  const {
    conversations,
    incomingRequests,
    outgoingRequests,
    isRefreshingSocial,
    refreshSocialData,
    isInitialLoadDone,
  } = useDMContext();
  
  const {
    getMessages,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    isLoadingMessages,
    loadMessages,
  } = useMessagesCache();
  
  const [messages, setLocalMessages] = useState<Message[]>([]);
  const [isLoadingCurrentMessages, setIsLoadingCurrentMessages] = useState(true);
  const [friendRequestError, setFriendRequestError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [voiceChannel, setVoiceChannel] = useState<{ channelName: string; guildName: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const selectedUser = conversations.find((u) => u.id === userId);
  const dmChannelId = userId ? `dm_${userId}` : "";
  const { initiateCall } = useGlobalVoiceCall();
  
  const previousUserIdRef = useRef<string>("");

  useEffect(() => {
    if (!userId || !isInitialLoadDone) return;

    if (userId === previousUserIdRef.current) return;
    previousUserIdRef.current = userId;

    const cached = getMessages(userId);

    if (cached !== null && cached !== undefined) {
      setLocalMessages(cached);
      setMessages(userId, cached);
      setIsLoadingCurrentMessages(false);
      return;
    }

    setIsLoadingCurrentMessages(true);

    loadMessages(userId).then((msgs) => {
      setLocalMessages(msgs ?? []);
      setMessages(userId, msgs ?? []);
      setIsLoadingCurrentMessages(false);
    });
  }, [userId, isInitialLoadDone, getMessages, setMessages, loadMessages]);

  const { isConnected, send, authenticate } = useWebSocket({
    onMessage: (message: Message) => {
      if (message.channelId === dmChannelId) {
        setLocalMessages((prev) => {
          const filtered = prev.filter(m => !m.id.startsWith("temp_"));
          if (filtered.some((m) => m.id === message.id)) return prev;
          const updated = [...filtered, message];
          setMessages(userId, updated);
          return updated;
        });
      } else {
        const incomingUserId = message.channelId.replace("dm_", "");
        if (incomingUserId && !conversations.some(c => c.id === incomingUserId)) {
          refreshSocialData().catch(() => {});
        }
      }
    },
  });

  useEffect(() => {
    if (isConnected && token) {
      authenticate(token);
    }
  }, [isConnected, token, authenticate]);

  useEffect(() => {
    if (!isInitialLoadDone) {
      refreshSocialData();
    }
  }, [isInitialLoadDone, refreshSocialData]);

  useEffect(() => {
    setFriendRequestError("");
    
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

  const mapToCallingUser = useCallback((dmUser: any): CallingUser => {
    return {
      id: dmUser.id,
      username: dmUser.username,
      displayName: dmUser.displayName,
      avatarUrl: dmUser.avatarUrl ?? "",
    };
  }, []);

  const handleStartVoiceCall = useCallback(() => {
    if (!selectedUser) {
      return;
    }
    initiateCall(mapToCallingUser(selectedUser));
  }, [initiateCall, mapToCallingUser, selectedUser]);

  const handleSendMessage = async (content: string, files: File[]) => {
    if (!userId || !dmChannelId || !content.trim()) return;

    if (user) {
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: dmChannelId,
        author: user,
        content,
        createdAt: new Date().toISOString(),
        attachments: files.map((file, i) => ({
          id: `temp-${Date.now()}-${i}`,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          url: URL.createObjectURL(file),
        })),
      };
      const updated = [...messages, optimisticMessage];
      setLocalMessages(updated);
      setMessages(userId, updated);
    }

    const sentOverSocket = send(dmChannelId, content);
    if (!sentOverSocket) {
      try {
        await dmApi.sendMessage(userId, content);
      } catch {
        console.error("Failed to send message");
      }
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    setFriendRequestError("");
    try {
      await friendsApi.sendRequest(targetUserId);
      setSearchValue("");
      setSearchResults([]);
      await refreshSocialData();
    } catch (err) {
      setFriendRequestError(
        err instanceof Error ? err.message : "Could not send friend request."
      );
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendsApi.acceptRequest(requestId);
      await refreshSocialData();
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendsApi.declineRequest(requestId);
      await refreshSocialData();
    } catch (err) {
      console.error("Failed to decline request:", err);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    const updated = messages.map((m) =>
      m.id === messageId
        ? { ...m, content: newContent, editedAt: new Date().toISOString() }
        : m
    );
    setLocalMessages(updated);
    setMessages(userId, updated);
    updateMessage(userId, messageId, { content: newContent, editedAt: new Date().toISOString() });
  };

  const handleDeleteMessage = (messageId: string) => {
    const updated = messages.filter((m) => m.id !== messageId);
    setLocalMessages(updated);
    setMessages(userId, updated);
    deleteMessage(userId, messageId);
  };

  const statusColor = (status: string) =>
    status === "online" ? "var(--success)" : "var(--warning)";
  const statusLabel = (status: string) =>
    status === "online" ? "Online" : "Idle";

  const bottomSlot = user ? (
    <>
      {voiceChannel && (
        <div className="voice-bar-wrap">
          <div className="voice-bar-inner">
            <p className="voice-bar-channel">🔊 {voiceChannel.channelName}</p>
            <p className="voice-bar-guild">{voiceChannel.guildName}</p>
            <button
              className="voice-bar-close"
              onClick={() => setVoiceChannel(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <UserPanel
        user={user}
        richPresence={MOCK_RICH_PRESENCE}
        isMuted={isMuted}
        isDeafened={isDeafened}
        onToggleMute={() => setIsMuted((m) => !m)}
        onToggleDeafen={() => setIsDeafened((d) => !d)}
        onLogout={logout}
        onSave={(updates) => { Object.assign(user, updates); }}
      />
    </>
  ) : null;

  const outgoingTargetIds = new Set(outgoingRequests.map(r => r.receiver.id));

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
      <DMSidebar
        conversations={conversations}
        selectedUserId={userId}
        onSelectUser={(id) => router.push(`/channels/me/${id}`)}
        isConnected={isConnected}
        bottomSlot={bottomSlot}
      />

      {selectedUser ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              height: 56,
              padding: "0 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                {selectedUser.displayName}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: statusColor(selectedUser.status),
                }}
              >
                {statusLabel(selectedUser.status)}
              </p>
            </div>

            <button
              onClick={handleStartVoiceCall}
              style={{
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "50%",
                marginLeft: "8px",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--success)";
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Phone size={18} />
            </button>
          </div>

          {isLoadingCurrentMessages ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>Loading messages...</p>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="empty-state" style={{ flex: 1 }}>
                  <MessageCircle size={52} style={{ opacity: 0.2 }} />
                  <span
                    style={{
                      fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Start the conversation
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Be the first to send a message.
                  </span>
                </div>
              )}
              {messages.length > 0 && (
                <MessageList
                  messages={messages}
                  currentUserId={user?.id}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              )}
              <MessageInput channelName={selectedUser.displayName} onSend={handleSendMessage} />
            </>
          )}
        </div>
      ) : (
        <div className="empty-state" style={{ flex: 1 }}>
          <MessageCircle size={52} style={{ opacity: 0.2 }} />
          <span
            style={{
              fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            Select a conversation
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Choose a friend to start messaging
          </span>
        </div>
      )}
    </div>
  );
}