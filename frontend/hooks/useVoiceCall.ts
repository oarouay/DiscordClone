"use client";

import type { IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStompContext } from "@/context/StompContext";
import {
  type CallSession,
  type CallState,
  type SignalingMessage,
  SignalingType,
  type User,
} from "@/types/calling";

const SIGNAL_SEND_DESTINATION = "/app/signal";
const SIGNAL_SUBSCRIPTION_DESTINATION = "/user/queue/signal";
const CALL_TIMEOUT_MS = 30_000;

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

type UseVoiceCallReturn = {
  callState: CallState;
  remoteUser: User | null;
  isMuted: boolean;
  duration: number;
  wasDeclined: boolean;
  session: CallSession;
  initiateCall: (user: User) => void;
  acceptCall: () => void;
  declineCall: () => void;
  hangUp: () => void;
  toggleMute: () => void;
};

export function useVoiceCall(): UseVoiceCallReturn {
  const { user } = useAuth();
  const { client, connected } = useStompContext();

  const [callState, setCallState] = useState<CallState>("idle");
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [wasDeclined, setWasDeclined] = useState(false);

  const callStateRef = useRef<CallState>("idle");
  const remoteUserRef = useRef<User | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateBufferRef = useRef<RTCIceCandidate[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const userDirectoryRef = useRef<Map<string, User>>(new Map());
  const declineResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    remoteUserRef.current = remoteUser;
  }, [remoteUser]);

  const clearDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const clearCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  }, []);

  const startDurationTimer = useCallback(() => {
    clearDurationTimer();
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, [clearDurationTimer]);

  const ensureRemoteAudioElement = useCallback(() => {
    if (remoteAudioRef.current) {
      return remoteAudioRef.current;
    }

    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.style.display = "none";
    document.body.appendChild(audio);
    remoteAudioRef.current = audio;
    return audio;
  }, []);

  const getOrCreateUserById = useCallback((id: string): User => {
    const known = userDirectoryRef.current.get(id);
    if (known) {
      return known;
    }

    // This is a fallback. In a real app, you'd fetch user details from an API.
    return {
      id,
      username: `User ${id.substring(0, 6)}`,
      displayName: `User ${id.substring(0, 6)}`,
      avatarUrl: "",
    };
  }, []);

  const setRemoteUserSafely = useCallback((nextUser: User | null) => {
    if (nextUser) {
      userDirectoryRef.current.set(nextUser.id, nextUser);
    }
    setRemoteUser(nextUser);
  }, []);

  const publishSignal = useCallback(
    (type: SignalingType, recipientId: string, payload: string | null = null) => {
      if (!client || !connected || !user?.id) {
        return;
      }

      const message: SignalingMessage = {
        type,
        senderId: user.id,
        recipientId,
        payload: type === SignalingType.CALL_INITIATE ? JSON.stringify(user) : payload,
      };

      client.publish({
        destination: SIGNAL_SEND_DESTINATION,
        body: JSON.stringify(message),
      });
    },
    [client, connected, user]
  );

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const [audioTrack] = stream.getAudioTracks();
    if (audioTrack) {
      audioTrack.enabled = !isMuted;
    }

    localStreamRef.current = stream;
    return stream;
  }, [isMuted]);

  const ensurePeerConnection = useCallback(
    async (recipientId: string) => {
      if (pcRef.current) {
        return pcRef.current;
      }

      const pc = new RTCPeerConnection(RTC_CONFIG);

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) {
          return;
        }

        const remoteAudio = ensureRemoteAudioElement();
        remoteAudio.srcObject = stream;
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        publishSignal(
          SignalingType.WEBRTC_ICE_CANDIDATE,
          recipientId,
          JSON.stringify(event.candidate.toJSON())
        );
      };

      const stream = await ensureLocalStream();
      const existingTrackIds = new Set(
        pc.getSenders().map((sender) => sender.track?.id).filter((id): id is string => Boolean(id))
      );

      for (const track of stream.getTracks()) {
        if (!existingTrackIds.has(track.id)) {
          pc.addTrack(track, stream);
        }
      }

      pcRef.current = pc;
      return pc;
    },
    [ensureLocalStream, ensureRemoteAudioElement, publishSignal]
  );

  const flushIceCandidateBuffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) {
      return;
    }

    const bufferedCandidates = [...iceCandidateBufferRef.current];
    iceCandidateBufferRef.current = [];

    for (const candidate of bufferedCandidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Ignore single-candidate failures to continue processing the remainder.
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    clearDurationTimer();
    clearCallTimeout();

    iceCandidateBufferRef.current = [];

    setCallState("idle");
    setRemoteUserSafely(null);
    setIsMuted(false);
    setDuration(0);

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, [clearCallTimeout, clearDurationTimer, setRemoteUserSafely]);

  const initiateCall = useCallback(
    (nextUser: User) => {
      if (!nextUser.id) {
        return;
      }

      userDirectoryRef.current.set(nextUser.id, nextUser);
      setRemoteUserSafely(nextUser);
      setCallState("calling");
      setDuration(0);

      publishSignal(SignalingType.CALL_INITIATE, nextUser.id, null);

      clearCallTimeout();
      callTimeoutRef.current = setTimeout(() => {
        cleanup();
      }, CALL_TIMEOUT_MS);
    },
    [cleanup, clearCallTimeout, publishSignal, setRemoteUserSafely]
  );

  const acceptCall = useCallback(() => {
    const currentRemoteUser = remoteUserRef.current;
    if (!currentRemoteUser) {
      return;
    }

    clearCallTimeout();
    publishSignal(SignalingType.CALL_ACCEPT, currentRemoteUser.id, null);
    setCallState("connected");
    startDurationTimer();
  }, [clearCallTimeout, publishSignal, startDurationTimer]);

  const declineCall = useCallback(() => {
    const currentRemoteUser = remoteUserRef.current;
    if (currentRemoteUser) {
      publishSignal(SignalingType.CALL_DECLINE, currentRemoteUser.id, null);
    }
    cleanup();
  }, [cleanup, publishSignal]);

  const hangUp = useCallback(() => {
    const currentRemoteUser = remoteUserRef.current;
    if (currentRemoteUser) {
      publishSignal(SignalingType.CALL_HANGUP, currentRemoteUser.id, null);
    }
    cleanup();
  }, [cleanup, publishSignal]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      const [audioTrack] = localStreamRef.current?.getAudioTracks() ?? [];
      if (audioTrack) {
        audioTrack.enabled = !nextMuted;
      }
      return nextMuted;
    });
  }, []);

  const handleIncomingSignal = useCallback(
    async (signal: SignalingMessage) => {
      switch (signal.type) {
        case SignalingType.CALL_INITIATE: {
          if (callStateRef.current !== "idle") {
            publishSignal(SignalingType.CALL_DECLINE, signal.senderId, null);
            break;
          }
          const sender = signal.payload ? (JSON.parse(signal.payload) as User) : getOrCreateUserById(signal.senderId);
          setRemoteUserSafely(sender);
          setCallState("ringing");
          break;
        }

        case SignalingType.CALL_ACCEPT: {
          const currentRemoteUser = remoteUserRef.current ?? getOrCreateUserById(signal.senderId);
          setRemoteUserSafely(currentRemoteUser);
          clearCallTimeout();

          const pc = await ensurePeerConnection(currentRemoteUser.id);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          publishSignal(
            SignalingType.WEBRTC_OFFER,
            currentRemoteUser.id,
            JSON.stringify(offer)
          );

          setCallState("connected");
          startDurationTimer();
          break;
        }

        case SignalingType.CALL_DECLINE: {
          cleanup();
          setWasDeclined(true);
          if (declineResetTimeoutRef.current) {
            clearTimeout(declineResetTimeoutRef.current);
          }
          declineResetTimeoutRef.current = setTimeout(() => {
            setWasDeclined(false);
            declineResetTimeoutRef.current = null;
          }, 2000);
          break;
        }

        case SignalingType.CALL_HANGUP:
        case SignalingType.CALL_TIMEOUT: {
          cleanup();
          break;
        }

        case SignalingType.WEBRTC_OFFER: {
          if (!signal.payload) {
            break;
          }

          const sender = getOrCreateUserById(signal.senderId);
          setRemoteUserSafely(sender);

          const pc = await ensurePeerConnection(sender.id);
          const offer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          await flushIceCandidateBuffer();

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          publishSignal(SignalingType.WEBRTC_ANSWER, sender.id, JSON.stringify(answer));

          setCallState("connected");
          startDurationTimer();
          break;
        }

        case SignalingType.WEBRTC_ANSWER: {
          if (!signal.payload || !pcRef.current) {
            break;
          }

          const answer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          await flushIceCandidateBuffer();
          break;
        }

        case SignalingType.WEBRTC_ICE_CANDIDATE: {
          if (!signal.payload) {
            break;
          }

          const parsedCandidate = JSON.parse(signal.payload) as RTCIceCandidateInit;
          const candidate = new RTCIceCandidate(parsedCandidate);

          if (pcRef.current?.remoteDescription) {
            await pcRef.current.addIceCandidate(candidate);
          } else {
            iceCandidateBufferRef.current.push(candidate);
          }
          break;
        }
      }
    },
    [
      cleanup,
      clearCallTimeout,
      ensurePeerConnection,
      flushIceCandidateBuffer,
      getOrCreateUserById,
      publishSignal,
      setRemoteUserSafely,
      startDurationTimer,
    ]
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentRemoteUser = remoteUserRef.current;
      if (!client || !connected || !user?.id || !currentRemoteUser) {
        return;
      }

      if (callStateRef.current !== "connected") {
        return;
      }

      const message: SignalingMessage = {
        type: SignalingType.CALL_HANGUP,
        senderId: user.id,
        recipientId: currentRemoteUser.id,
        payload: null,
      };

      client.publish({
        destination: SIGNAL_SEND_DESTINATION,
        body: JSON.stringify(message),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [client, connected, user]);

  useEffect(() => {
    if (!client || !connected || !user?.id) {
      return;
    }

    const subscription = client.subscribe(
      SIGNAL_SUBSCRIPTION_DESTINATION,
      async (frame: IMessage) => {
        try {
          const signal = JSON.parse(frame.body) as SignalingMessage;
          if (signal.recipientId !== user.id) {
            return;
          }
          await handleIncomingSignal(signal);
        } catch {
          // Ignore malformed signal payloads so a single bad frame does not break the hook.
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [client, connected, handleIncomingSignal, user?.id]);

  useEffect(() => {
    return () => {
      cleanup();

      if (declineResetTimeoutRef.current) {
        clearTimeout(declineResetTimeoutRef.current);
        declineResetTimeoutRef.current = null;
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.remove();
        remoteAudioRef.current = null;
      }
    };
  }, [cleanup]);

  const session = useMemo<CallSession>(
    () => ({
      callState,
      remoteUser,
      isMuted,
      duration,
    }),
    [callState, remoteUser, isMuted, duration]
  );

  return {
    callState,
    remoteUser,
    isMuted,
    duration,
    wasDeclined,
    session,
    initiateCall,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
  };
}

