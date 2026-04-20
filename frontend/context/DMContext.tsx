"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from "react";
import { friendsApi, type FriendResponse, type FriendRequestResponse } from "@/lib/friends";
import { dmApi } from "@/lib/dms";
import type { User } from "@/types";

type DMContextValue = {
  conversations: User[];
  friends: FriendResponse[];
  incomingRequests: FriendRequestResponse[];
  outgoingRequests: FriendRequestResponse[];
  isRefreshingSocial: boolean;
  isInitialLoadDone: boolean;
  refreshSocialData: () => Promise<void>;
};

const DMContext = createContext<DMContextValue | null>(null);

export function DMProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<User[]>([]);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestResponse[]>([]);
  const [isRefreshingSocial, setIsRefreshingSocial] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
  
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const cached = localStorage.getItem("dmCache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setConversations(data.conversations || []);
        setFriends(data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
      } catch (e) {
        console.error("Failed to load cache:", e);
      }
    }
  }, []);

  const refreshSocialData = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    
    setIsRefreshingSocial(true);
    try {
      const [conversationResponse, friendsList, incoming, outgoing] = await Promise.all([
        dmApi.listConversations(),
        friendsApi.listFriends(),
        friendsApi.listIncomingRequests(),
        friendsApi.listOutgoingRequests(),
      ]);

      const convs = conversationResponse.map((item) => item.user);
      setConversations(convs);
      setFriends(friendsList);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
      
      localStorage.setItem("dmCache", JSON.stringify({
        conversations: convs,
        friends: friendsList,
        incomingRequests: incoming,
        outgoingRequests: outgoing,
      }));
      
      setIsInitialLoadDone(true);
    } catch (error) {
      console.error("Failed to refresh social data:", error);
    } finally {
      setIsRefreshingSocial(false);
      setIsInitialLoadDone(true);
      isRefreshingRef.current = false;
    }
  }, []);

  return (
    <DMContext.Provider value={{
      conversations,
      friends,
      incomingRequests,
      outgoingRequests,
      isRefreshingSocial,
      isInitialLoadDone,
      refreshSocialData,
    }}>
      {children}
    </DMContext.Provider>
  );
}

export function useDMContext() {
  const context = useContext(DMContext);
  if (!context) {
    throw new Error("useDMContext must be used within DMProvider");
  }
  return context;
}