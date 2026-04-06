"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Member, Role } from "@/types";
import { mockMembers, mockRoles, mockVoiceChannelMembers, mockMemberVoiceStates } from "@/lib/mock";

type MockDataContextValue = {
  members: Member[];
  roles: Role[];
  voiceChannelMembers: Record<string, Member[]>;
  bannedMembers: Member[];
  memberVoiceStates: Record<string, { isMuted: boolean; isDeafened: boolean; serverMuted?: boolean; serverDeafened?: boolean }>;
  memberTimeouts: Record<string, string | null>;
  collapsedCategories: Set<string>;
  
  // Member management
  updateMemberRoles: (memberId: string, roleIds: string[]) => void;
  timeoutMember: (memberId: string, durationMs: number) => void;
  kickMember: (memberId: string) => void;
  banMember: (memberId: string) => void;
  setMemberVoiceState: (memberId: string, state: { isMuted?: boolean; isDeafened?: boolean; serverMuted?: boolean; serverDeafened?: boolean }) => void;
  addMemberToVoiceChannel: (memberId: string, channelId: string) => void;
  removeMemberFromVoiceChannel: (memberId: string) => void;
  
  // Role management
  addRole: (role: Role) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  deleteRole: (roleId: string) => void;
  
  // Category management
  toggleCategoryCollapse: (categoryId: string) => void;
  isCategoryCollapsed: (categoryId: string) => boolean;
  
  // Timeout check
  getMemberTimeout: (memberId: string) => string | null;
  isMemberTimedOut: (memberId: string) => boolean;
};

const MockDataContext = createContext<MockDataContextValue | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [voiceChannelMembers, setVoiceChannelMembers] = useState<Record<string, Member[]>>(mockVoiceChannelMembers);
  const [bannedMembers, setBannedMembers] = useState<Member[]>([]);
  const [memberVoiceStates, setMemberVoiceStates] = useState(mockMemberVoiceStates);
  const [memberTimeouts, setMemberTimeouts] = useState<Record<string, string | null>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const updateMemberRoles = useCallback((memberId: string, roleIds: string[]) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === memberId
          ? { ...m, roles: roles.filter((r) => roleIds.includes(r.id)) }
          : m
      )
    );
  }, [roles]);

  const timeoutMember = useCallback((memberId: string, durationMs: number) => {
    const timeoutUntil = new Date(Date.now() + durationMs).toISOString();
    setMemberTimeouts((prev) => ({ ...prev, [memberId]: timeoutUntil }));
    
    // Auto-clear timeout after duration
    setTimeout(() => {
      setMemberTimeouts((prev) => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }, durationMs);
  }, []);

  const kickMember = useCallback((memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== memberId));
    setVoiceChannelMembers((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((channelId) => {
        updated[channelId] = updated[channelId].filter((m) => m.userId !== memberId);
      });
      return updated;
    });
  }, []);

  const banMember = useCallback((memberId: string) => {
    const memberToBan = members.find((m) => m.userId === memberId);
    if (memberToBan) {
      setBannedMembers((prev) => [...prev, memberToBan]);
      kickMember(memberId);
    }
  }, [members, kickMember]);

  const setMemberVoiceState = useCallback(
    (memberId: string, state: Record<string, boolean>) => {
      setMemberVoiceStates((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], ...state },
      }));
    },
    []
  );

  const addMemberToVoiceChannel = useCallback((memberId: string, channelId: string) => {
    const member = members.find((m) => m.userId === memberId);
    if (member) {
      setVoiceChannelMembers((prev) => {
        const updated = { ...prev };
        // Remove from all channels first
        Object.keys(updated).forEach((cId) => {
          updated[cId] = updated[cId].filter((m) => m.userId !== memberId);
        });
        // Add to target channel
        updated[channelId] = [...(updated[channelId] || []), member];
        return updated;
      });
    }
  }, [members]);

  const removeMemberFromVoiceChannel = useCallback((memberId: string) => {
    setVoiceChannelMembers((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((cId) => {
        updated[cId] = updated[cId].filter((m) => m.userId !== memberId);
      });
      return updated;
    });
  }, []);

  const addRole = useCallback((role: Role) => {
    setRoles((prev) => [...prev, role]);
  }, []);

  const updateRole = useCallback((roleId: string, updates: Partial<Role>) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteRole = useCallback((roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        roles: m.roles.filter((r) => r.id !== roleId),
      }))
    );
  }, []);

  const toggleCategoryCollapse = useCallback((categoryId: string) => {
    setCollapsedCategories((prev) => {
      const updated = new Set(prev);
      if (updated.has(categoryId)) {
        updated.delete(categoryId);
      } else {
        updated.add(categoryId);
      }
      // Persist to localStorage
      localStorage.setItem("collapsedCategories", JSON.stringify(Array.from(updated)));
      return updated;
    });
  }, []);

  const isCategoryCollapsed = useCallback((categoryId: string) => {
    return collapsedCategories.has(categoryId);
  }, [collapsedCategories]);

  const getMemberTimeout = useCallback((memberId: string) => {
    return memberTimeouts[memberId] ?? null;
  }, [memberTimeouts]);

  const isMemberTimedOut = useCallback((memberId: string) => {
    const timeoutUntil = memberTimeouts[memberId];
    if (!timeoutUntil) return false;
    return new Date(timeoutUntil) > new Date();
  }, [memberTimeouts]);

  return (
    <MockDataContext.Provider
      value={{
        members,
        roles,
        voiceChannelMembers,
        bannedMembers,
        memberVoiceStates,
        memberTimeouts,
        collapsedCategories,
        updateMemberRoles,
        timeoutMember,
        kickMember,
        banMember,
        setMemberVoiceState,
        addMemberToVoiceChannel,
        removeMemberFromVoiceChannel,
        addRole,
        updateRole,
        deleteRole,
        toggleCategoryCollapse,
        isCategoryCollapsed,
        getMemberTimeout,
        isMemberTimedOut,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used inside MockDataProvider");
  return ctx;
}
