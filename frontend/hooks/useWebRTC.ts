"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type Participant = {
  userId: string;
  displayName: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  stream?: MediaStream;
};

type SignalMessage =
  | { type: "offer"; fromUserId: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; fromUserId: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; fromUserId: string; candidate: RTCIceCandidateInit }
  | { type: "user-joined"; userId: string; displayName: string }
  | { type: "user-left"; userId: string };

type UseWebRTCOptions = {
  channelId: string;
  userId: string;
  displayName: string;
  onSignal: (message: object) => void;
};

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTC({ channelId, userId, displayName, onSignal }: UseWebRTCOptions) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const speakingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const createPeerConnection = useCallback(
    (remoteUserId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(RTC_CONFIG);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          onSignal({ type: "ice-candidate", toUserId: remoteUserId, candidate });
        }
      };

      pc.ontrack = ({ streams }) => {
        const [remoteStream] = streams;
        setParticipants((prev) =>
          prev.map((p) => (p.userId === remoteUserId ? { ...p, stream: remoteStream } : p))
        );

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(remoteStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const detect = () => {
          analyser.getByteFrequencyData(data);
          const volume = data.reduce((a, b) => a + b, 0) / data.length;
          const speaking = volume > 10;

          setParticipants((prev) =>
            prev.map((p) => (p.userId === remoteUserId ? { ...p, isSpeaking: speaking } : p))
          );

          if (speaking) {
            const existing = speakingTimersRef.current.get(remoteUserId);
            if (existing) clearTimeout(existing);
            speakingTimersRef.current.set(
              remoteUserId,
              setTimeout(() => {
                setParticipants((prev) =>
                  prev.map((p) => (p.userId === remoteUserId ? { ...p, isSpeaking: false } : p))
                );
              }, 800)
            );
          }

          if (!audioContext.state.includes("closed")) {
            requestAnimationFrame(detect);
          }
        };
        detect();
      };

      peersRef.current.set(remoteUserId, pc);
      return pc;
    },
    [onSignal]
  );

  const join = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsJoined(true);

      onSignal({ type: "join", channelId, userId, displayName });
    } catch {
      throw new Error("Microphone access denied");
    }
  }, [channelId, userId, displayName, onSignal]);

  const leave = useCallback(() => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setParticipants([]);
    setIsJoined(false);

    onSignal({ type: "leave", channelId, userId });
  }, [channelId, userId, onSignal]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((prev) => !prev);
    onSignal({ type: "mute-update", userId, isMuted: !isMuted });
  }, [isMuted, userId, onSignal]);

  const toggleDeafen = useCallback(() => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, stream: p.stream }))
    );
    setIsDeafened((prev) => !prev);
    onSignal({ type: "deafen-update", userId, isDeafened: !isDeafened });
  }, [isDeafened, userId, onSignal]);

  const handleSignal = useCallback(
    async (message: SignalMessage) => {
      switch (message.type) {
        case "user-joined": {
          setParticipants((prev) => [
            ...prev,
            {
              userId: message.userId,
              displayName: message.displayName,
              isMuted: false,
              isDeafened: false,
              isSpeaking: false,
            },
          ]);

          const pc = createPeerConnection(message.userId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          onSignal({ type: "offer", toUserId: message.userId, sdp: offer });
          break;
        }

        case "user-left": {
          peersRef.current.get(message.userId)?.close();
          peersRef.current.delete(message.userId);
          setParticipants((prev) => prev.filter((p) => p.userId !== message.userId));
          break;
        }

        case "offer": {
          const pc = createPeerConnection(message.fromUserId);
          await pc.setRemoteDescription(message.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          onSignal({ type: "answer", toUserId: message.fromUserId, sdp: answer });
          break;
        }

        case "answer": {
          const pc = peersRef.current.get(message.fromUserId);
          if (pc) await pc.setRemoteDescription(message.sdp);
          break;
        }

        case "ice-candidate": {
          const pc = peersRef.current.get(message.fromUserId);
          if (pc) await pc.addIceCandidate(message.candidate);
          break;
        }
      }
    },
    [createPeerConnection, onSignal]
  );

  useEffect(() => {
    return () => {
      if (isJoined) leave();
      speakingTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return {
    participants,
    isMuted,
    isDeafened,
    isJoined,
    localStream,
    join,
    leave,
    toggleMute,
    toggleDeafen,
    handleSignal,
  };
}