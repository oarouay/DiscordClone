"use client";

import { useCallback, useEffect, useRef, useReducer } from "react";
import { User, VoiceCallSignal, VoiceCallState } from "@/types/index";
import { useWebSocket } from "./useWebSocket";
import { useAuth } from "./useAuth";

// Extend window to include voice signal handler
declare global {
  interface Window {
    __voiceSignalHandler?: (message: string) => void;
  }
}

interface VoiceCallStateType {
  state: VoiceCallState;
  peer: User | null;
  isMuted: boolean;
  callStartTime: number | null;
}

type VoiceCallAction =
  | { type: "SET_STATE"; state: VoiceCallState; peer?: User | null }
  | { type: "SET_PEER"; peer: User | null }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_CALL_START_TIME"; time: number }
  | { type: "RESET" };

const initialState: VoiceCallStateType = {
  state: "idle",
  peer: null,
  isMuted: false,
  callStartTime: null,
};

function voiceCallReducer(
  state: VoiceCallStateType,
  action: VoiceCallAction
): VoiceCallStateType {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...state,
        state: action.state,
        peer: action.peer !== undefined ? action.peer : state.peer,
      };
    case "SET_PEER":
      return { ...state, peer: action.peer };
    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted };
    case "SET_CALL_START_TIME":
      return { ...state, callStartTime: action.time };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface UseVoiceCallReturn {
  state: VoiceCallState;
  peer: User | null;
  isMuted: boolean;
  callStartTime: number | null;
  initiateCall: (recipientId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  hangUp: () => Promise<void>;
  toggleMute: () => void;
}

/**
 * useVoiceCall Hook
 * Manages WebRTC peer-to-peer voice calling with STOMP signaling.
 * Handles state machine, media streams, and peer connections.
 */
export function useVoiceCall(): UseVoiceCallReturn {
  const [callState, dispatch] = useReducer(voiceCallReducer, initialState);
  const { user: currentUser } = useAuth();
  const { send, subscribe } = useWebSocket();

  // WebRTC and Media refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const remotePeerRef = useRef<User | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // ICE candidate buffering
  const iceCandidateBufferRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescriptionSetRef = useRef<boolean>(false);

  // Cleanup timeout refs for call timeouts
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Send a STOMP signal to the other peer via WebSocket
   */
  const sendSignal = useCallback(
    (signal: VoiceCallSignal) => {
      if (!currentUser) return;
      const payload = JSON.stringify(signal);
      // Use a special channel "signal" - backend will route to /app/signal
      send("signal", payload);
    },
    [currentUser, send]
  );

  /**
   * Acquire audio media stream
   */
  const acquireMediaStream = useCallback(async (): Promise<MediaStream> => {
    if (mediaStreamRef.current) {
      return mediaStreamRef.current;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    return stream;
  }, []);

  /**
   * Initialize RTCPeerConnection with local media
   */
  const initializePeerConnection = useCallback(async (): Promise<void> => {
    if (peerConnectionRef.current) return;

    const stream = await acquireMediaStream();
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    // Add local audio tracks to connection
    stream.getAudioTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        if (!remoteAudioRef.current) {
          remoteAudioRef.current = new Audio();
          remoteAudioRef.current.autoplay = true;
        }
        remoteAudioRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && remotePeerRef.current) {
        sendSignal({
          type: "WEBRTC_ICE_CANDIDATE",
          peerId: remotePeerRef.current.id,
          payload: event.candidate.toJSON(),
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "closed"
      ) {
        dispatch({ type: "SET_STATE", state: "ended" });
        setTimeout(() => dispatch({ type: "RESET" }), 1000);
      }
    };

    peerConnectionRef.current = peerConnection;
  }, [acquireMediaStream, sendSignal]);

  /**
   * Flushes buffered ICE candidates to the peer connection
   */
  const flushIceCandidates = useCallback(async (): Promise<void> => {
    const buffer = iceCandidateBufferRef.current;
    remoteDescriptionSetRef.current = true;

    if (peerConnectionRef.current) {
      for (const candidate of buffer) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.warn("[VoiceCall] Failed to add buffered ICE candidate:", err);
        }
      }
    }
    iceCandidateBufferRef.current = [];
  }, []);

  /**
   * Initiate a call to a recipient
   */
  const initiateCall = useCallback(
    async (recipientId: string) => {
      if (callState.state !== "idle") {
        console.warn("[VoiceCall] Cannot initiate; already in call", {
          state: callState.state,
        });
        return;
      }
      if (!currentUser) return;

      // Transition to calling
      const recipient = { id: recipientId } as User;
      remotePeerRef.current = recipient;
      dispatch({
        type: "SET_STATE",
        state: "calling",
        peer: recipient,
      });

      // Send CALL_INITIATE signal
      sendSignal({
        type: "CALL_INITIATE",
        callerId: currentUser.id,
        callerName: currentUser.displayName,
      });

      // Set 30-second timeout for call to be answered
      callTimeoutRef.current = setTimeout(() => {
        if (callState.state === "calling") {
          dispatch({ type: "RESET" });
          sendSignal({
            type: "CALL_TIMEOUT",
            peerId: recipientId,
          });
        }
      }, 30000);
    },
    [callState.state, currentUser, sendSignal]
  );

  /**
   * Accept an incoming call
   */
  const acceptCall = useCallback(async () => {
    if (callState.state !== "ringing" || !remotePeerRef.current) {
      return;
    }

    // Clear any pending timeout
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    try {
      // Initialize peer connection
      await initializePeerConnection();

      // Send CALL_ACCEPT signal
      sendSignal({
        type: "CALL_ACCEPT",
        peerId: remotePeerRef.current.id,
      });

      // Transition to connected
      dispatch({
        type: "SET_STATE",
        state: "connected",
      });

      dispatch({
        type: "SET_CALL_START_TIME",
        time: Date.now(),
      });
    } catch (err) {
      console.error("[VoiceCall] Error accepting call:", err);
      dispatch({ type: "RESET" });
    }
  }, [callState.state, initializePeerConnection, sendSignal]);

  /**
   * Decline an incoming call
   */
  const declineCall = useCallback(async () => {
    if (!remotePeerRef.current) return;

    // Clear any pending timeout
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    // Send CALL_DECLINE signal
    sendSignal({
      type: "CALL_DECLINE",
      peerId: remotePeerRef.current.id,
    });

    dispatch({ type: "RESET" });
  }, [sendSignal]);

  /**
   * Hang up the current call
   */
  const hangUp = useCallback(async () => {
    if (callState.state === "idle" || callState.state === "ended") {
      return;
    }

    // Clear any pending timeout
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    // Notify peer
    if (remotePeerRef.current) {
      sendSignal({
        type: "CALL_HANGUP",
        peerId: remotePeerRef.current.id,
      });
    }

    // Teardown WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop all media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Stop remote audio
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    // Reset state
    dispatch({ type: "SET_STATE", state: "ended" });
    setTimeout(() => dispatch({ type: "RESET" }), 1000);
  }, [callState.state, sendSignal]);

  /**
   * Toggle local microphone mute
   */
  const toggleMute = useCallback(() => {
    if (!mediaStreamRef.current) return;

    const audioTracks = mediaStreamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
      dispatch({ type: "TOGGLE_MUTE" });
    }
  }, []);

  /**
   * Handle incoming CALL_INITIATE signal
   */
  const handleCallInitiate = useCallback(
    (signal: Extract<VoiceCallSignal, { type: "CALL_INITIATE" }>) => {
      // If already in a call, auto-decline
      if (callState.state !== "idle") {
        sendSignal({
          type: "CALL_DECLINE",
          peerId: signal.callerId,
        });
        return;
      }

      // Create caller user object
      const caller: User = {
        id: signal.callerId,
        username: "",
        displayName: signal.callerName || "Unknown",
        email: "",
        status: "online",
      };

      remotePeerRef.current = caller;
      dispatch({
        type: "SET_STATE",
        state: "ringing",
        peer: caller,
      });

      // Set 30-second timeout for call to be answered
      callTimeoutRef.current = setTimeout(() => {
        if (callState.state === "ringing") {
          dispatch({ type: "RESET" });
          sendSignal({
            type: "CALL_TIMEOUT",
            peerId: signal.callerId,
          });
        }
      }, 30000);
    },
    [callState.state, sendSignal]
  );

  /**
   * Handle incoming CALL_ACCEPT signal
   */
  const handleCallAccept = useCallback(
    async (signal: Extract<VoiceCallSignal, { type: "CALL_ACCEPT" }>) => {
      if (callState.state !== "calling") return;

      // Clear call timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      try {
        // Initialize peer connection and create offer
        await initializePeerConnection();

        if (!peerConnectionRef.current) return;

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        // Send WEBRTC_OFFER to callee
        if (remotePeerRef.current) {
          sendSignal({
            type: "WEBRTC_OFFER",
            peerId: remotePeerRef.current.id,
            payload: offer,
          });
        }

        // Transition to connected
        dispatch({
          type: "SET_STATE",
          state: "connected",
        });

        dispatch({
          type: "SET_CALL_START_TIME",
          time: Date.now(),
        });
      } catch (err) {
        console.error("[VoiceCall] Error handling CALL_ACCEPT:", err);
        dispatch({ type: "RESET" });
      }
    },
    [callState.state, initializePeerConnection, sendSignal]
  );

  /**
   * Handle incoming CALL_DECLINE signal
   */
  const handleCallDecline = useCallback(
    (signal: Extract<VoiceCallSignal, { type: "CALL_DECLINE" }>) => {
      // Clear call timeout
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      // Show declined toast and reset state
      dispatch({ type: "RESET" });

      // In a real app, show toast: "Call declined"
      console.log("[VoiceCall] Call declined");
    },
    []
  );

  /**
   * Handle incoming CALL_HANGUP signal
   */
  const handleCallHangup = useCallback(async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    dispatch({ type: "SET_STATE", state: "ended" });
    setTimeout(() => dispatch({ type: "RESET" }), 1000);
  }, []);

  /**
   * Handle incoming CALL_TIMEOUT signal
   */
  const handleCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    dispatch({ type: "RESET" });
  }, []);

  /**
   * Handle incoming WEBRTC_OFFER signal (callee receives offer from caller)
   */
  const handleWebRtcOffer = useCallback(
    async (
      signal: Extract<VoiceCallSignal, { type: "WEBRTC_OFFER" }>
    ) => {
      if (callState.state !== "ringing") return;

      try {
        // Initialize peer connection and media
        await initializePeerConnection();

        if (!peerConnectionRef.current) return;

        // Set remote description (the offer from caller)
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.payload)
        );

        // Flush any buffered ICE candidates
        await flushIceCandidates();

        // Create and send answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        if (remotePeerRef.current) {
          sendSignal({
            type: "WEBRTC_ANSWER",
            peerId: remotePeerRef.current.id,
            payload: answer,
          });
        }
      } catch (err) {
        console.error("[VoiceCall] Error handling WEBRTC_OFFER:", err);
      }
    },
    [callState.state, initializePeerConnection, flushIceCandidates, sendSignal]
  );

  /**
   * Handle incoming WEBRTC_ANSWER signal (caller receives answer from callee)
   */
  const handleWebRtcAnswer = useCallback(
    async (
      signal: Extract<VoiceCallSignal, { type: "WEBRTC_ANSWER" }>
    ) => {
      if (!peerConnectionRef.current) return;

      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(signal.payload)
        );

        // Flush any buffered ICE candidates
        await flushIceCandidates();
      } catch (err) {
        console.error("[VoiceCall] Error handling WEBRTC_ANSWER:", err);
      }
    },
    [flushIceCandidates]
  );

  /**
   * Handle incoming WEBRTC_ICE_CANDIDATE signal
   */
  const handleWebRtcIceCandidate = useCallback(
    async (
      signal: Extract<VoiceCallSignal, { type: "WEBRTC_ICE_CANDIDATE" }>
    ) => {
      if (!peerConnectionRef.current) return;

      try {
        // If remote description is not set yet, buffer the candidate
        if (!remoteDescriptionSetRef.current) {
          iceCandidateBufferRef.current.push(signal.payload);
          return;
        }

        // Otherwise, add it immediately
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(signal.payload)
        );
      } catch (err) {
        console.warn("[VoiceCall] Error adding ICE candidate:", err);
      }
    },
    []
  );

  /**
   * Handle STOMP signal messages
   */
  const handleSignalMessage = useCallback(
    (message: string) => {
      try {
        const signal = JSON.parse(message) as VoiceCallSignal;

        switch (signal.type) {
          case "CALL_INITIATE":
            handleCallInitiate(signal);
            break;
          case "CALL_ACCEPT":
            handleCallAccept(signal);
            break;
          case "CALL_DECLINE":
            handleCallDecline(signal);
            break;
          case "CALL_HANGUP":
            handleCallHangup();
            break;
          case "CALL_TIMEOUT":
            handleCallTimeout();
            break;
          case "WEBRTC_OFFER":
            handleWebRtcOffer(signal);
            break;
          case "WEBRTC_ANSWER":
            handleWebRtcAnswer(signal);
            break;
          case "WEBRTC_ICE_CANDIDATE":
            handleWebRtcIceCandidate(signal);
            break;
        }
      } catch (err) {
        console.error("[VoiceCall] Error parsing signal:", err);
      }
    },
    [
      handleCallInitiate,
      handleCallAccept,
      handleCallDecline,
      handleCallHangup,
      handleCallTimeout,
      handleWebRtcOffer,
      handleWebRtcAnswer,
      handleWebRtcIceCandidate,
    ]
  );

  /**
   * Attach signal handler to window for WebSocket to invoke
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__voiceSignalHandler = handleSignalMessage;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.__voiceSignalHandler;
      }
    };
  }, [handleSignalMessage]);

  /**
   * Hook beforeunload to send CALL_HANGUP if connection is active
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        callState.state === "connected" &&
        remotePeerRef.current &&
        currentUser
      ) {
        const signal: VoiceCallSignal = {
          type: "CALL_HANGUP",
          peerId: remotePeerRef.current.id,
        };
        navigator.sendBeacon(
          "/api/signal",
          JSON.stringify(signal)
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [callState.state, currentUser]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
    };
  }, []);

  return {
    state: callState.state,
    peer: callState.peer,
    isMuted: callState.isMuted,
    callStartTime: callState.callStartTime,
    initiateCall,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
  };
}
