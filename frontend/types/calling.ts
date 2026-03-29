export const enum SignalingType {
  CALL_INITIATE = "CALL_INITIATE",
  CALL_ACCEPT = "CALL_ACCEPT",
  CALL_DECLINE = "CALL_DECLINE",
  CALL_HANGUP = "CALL_HANGUP",
  CALL_TIMEOUT = "CALL_TIMEOUT",
  WEBRTC_OFFER = "WEBRTC_OFFER",
  WEBRTC_ANSWER = "WEBRTC_ANSWER",
  WEBRTC_ICE_CANDIDATE = "WEBRTC_ICE_CANDIDATE",
}

export interface SignalingMessage {
  type: SignalingType;
  senderId: string;
  recipientId: string;
  payload: string | null;
}

export type CallState = "idle" | "calling" | "ringing" | "connected" | "ended";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface CallSession {
  callState: CallState;
  remoteUser: User | null;
  isMuted: boolean;
  duration: number;
}