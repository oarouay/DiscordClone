"use client";

import { useState, useCallback, useRef } from "react";

interface UseWebRTCOptions {
  onRemoteStream?: (stream: MediaStream) => void;
  onLocalStream?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
  const { onRemoteStream, onLocalStream, onError } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Initialize WebRTC connection
  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // TODO: Replace with actual WebRTC implementation when backend is ready
      console.log("[WebRTC] Connection not yet implemented");
      setIsConnecting(false);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("WebRTC connection failed");
      if (onError) onError(err);
      setIsConnecting(false);
    }
  }, [onError]);

  // Get local audio/video stream
  const getLocalStream = useCallback(
    async (constraints: MediaStreamConstraints = { audio: true, video: false }) => {
      try {
        // TODO: Replace with actual implementation when backend is ready
        console.log("[WebRTC] Getting local stream - not yet implemented");
        return null;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to get local stream");
        if (onError) onError(err);
        return null;
      }
    },
    [onError]
  );

  // Hang up call
  const hangUp = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    setIsConnected(false);
  }, [localStream]);

  return {
    isConnected,
    isConnecting,
    localStream,
    connect,
    getLocalStream,
    hangUp,
  };
}
