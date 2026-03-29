"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/context/AuthContext";
import { DMSidebar } from "@/components/dm/DMSidebar";
import { UserPanel } from "@/components/shared/UserPanel";
import { VoiceControls } from "@/components/voice/VoiceControls";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import type { Message } from "@/types";
import { dmApi } from "@/lib/dms";
import { friendsApi, type FriendRequestResponse } from "@/lib/friends";
import { FriendsPanel } from "@/components/dm/FriendsPanel";
import type { User } from "@/types";
import type { User as CallingUser } from "@/types/calling";
import { useGlobalVoiceCall } from "@/context/GlobalVoiceCallContext";

const MOCK_RICH_PRESENCE = { activity: "Playing Elden Ring", detail: "Exploring Limgrave • 2h 14m" };

export default function DirectMessagesPage() {
  const { user, token } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestResponse[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isRefreshingSocial, setIsRefreshingSocial] = useState(false);
  const [voiceChannel, setVoiceChannel] = useState<{ channelName: string; guildName: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const selectedUser = conversations.find((u) => u.id === selectedUserId);
  const dmChannelId = selectedUserId ? `dm_${selectedUserId}` : "";
  const { initiateCall } = useGlobalVoiceCall();

  const { isConnected, send, authenticate } = useWebSocket({
    onMessage: (message: Message) => {
      if (message.channelId === dmChannelId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
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

  const refreshSocialData = useCallback(async () => {
    setIsRefreshingSocial(true);
    try {
      const [conversationResponse, incoming, outgoing] = await Promise.all([
        dmApi.listConversations(),
        friendsApi.listIncomingRequests(),
        friendsApi.listOutgoingRequests(),
      ]);

      setConversations(conversationResponse.map((item) => item.user));
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      if (!selectedUserId && conversationResponse.length > 0) {
        setSelectedUserId(conversationResponse[0].user.id);
      }
    } finally {
      setIsRefreshingSocial(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (!user) return;
    refreshSocialData().catch(() => {
      setConversations([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
    });
  }, [user, refreshSocialData]);

  useEffect(() => {
    if (!selectedUserId) return;
    dmApi.getMessages(selectedUserId)
      .then((history) => setMessages(history))
      .catch(() => setMessages([]));
  }, [selectedUserId, dmChannelId]);

  useEffect(() => {
    const normalized = searchValue.trim();
    if (normalized.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      friendsApi.searchUsers(normalized)
        .then((results) => setSearchResults(results))
        .catch(() => setSearchResults([]));
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const mapToCallingUser = useCallback((dmUser: User): CallingUser => {
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
    if (!selectedUserId || !dmChannelId || !content.trim()) return;

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
      setMessages((prev) => [...prev, optimisticMessage]);
    }

    const sentOverSocket = send(dmChannelId, content);
    if (!sentOverSocket) {
      try {
        await dmApi.sendMessage(selectedUserId, content);
      } catch {
        // Error handling
      }
    }
  };

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

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, editedAt: new Date().toISOString() }
          : m
      )
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
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
            <VoiceControls
              isMuted={isMuted}
              isDeafened={isDeafened}
              onToggleMute={() => setIsMuted((m) => !m)}
              onToggleDeafen={() => setIsDeafened((d) => !d)}
              onLeave={() => { setVoiceChannel(null); setIsMuted(false); setIsDeafened(false); }}
            />
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
        onLogout={() => {}}
        onSave={(updates) => { Object.assign(user, updates); }}
      />
    </>
  ) : null;

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
      <DMSidebar
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        isConnected={isConnected}
        topSlot={
          <FriendsPanel
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            searchResults={searchResults}
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

      {selectedUser ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              height: 52,
              minHeight: 52,
              borderBottom: "1px solid var(--border)",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--bg-primary)",
              flexShrink: 0,
            }}
          >
            <MessageCircle size={18} style={{ color: "var(--text-primary)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "0.3px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedUser.displayName}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                @{selectedUser.username}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: statusColor(selectedUser.status), flexShrink: 0 }}>
              {statusLabel(selectedUser.status)}
            </span>
              <button
                onClick={handleStartVoiceCall}
                title="Start Voice Call"
                disabled={!selectedUser}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  marginLeft: "8px",
                  transition: "background 0.2s, color 0.2s"
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

            <MessageList
              messages={messages}
              currentUserId={user?.id}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          <MessageInput channelName={selectedUser.displayName} onSend={handleSendMessage} />
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
            No conversations yet
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Send or accept a friend request to start a direct message.
          </span>
        </div>
      )}
    </div>
  );
}