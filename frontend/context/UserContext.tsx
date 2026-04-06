"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { User } from "@/types";

type UserContextValue = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  updateUserStatus: (userId: string, status: User["status"]) => void;
  getUserStatus: (userId: string) => User["status"];
  simulateStatusChange: (userId: string, newStatus: User["status"]) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(initialUser);
  const [userStatuses, setUserStatuses] = useState<Record<string, User["status"]>>({});

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  const updateUserStatus = useCallback((userId: string, status: User["status"]) => {
    if (userId === currentUser?.id) {
      setCurrentUserState((prev) => (prev ? { ...prev, status } : null));
    }
    setUserStatuses((prev) => ({ ...prev, [userId]: status }));
  }, [currentUser?.id]);

  const getUserStatus = useCallback((userId: string): User["status"] => {
    if (userId === currentUser?.id) {
      return currentUser.status;
    }
    return userStatuses[userId] ?? "offline";
  }, [currentUser, userStatuses]);

  const simulateStatusChange = useCallback((userId: string, newStatus: User["status"]) => {
    updateUserStatus(userId, newStatus);
  }, [updateUserStatus]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateUserStatus,
        getUserStatus,
        simulateStatusChange,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
}
