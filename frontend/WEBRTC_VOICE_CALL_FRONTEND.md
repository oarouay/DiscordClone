# WebRTC Peer-to-Peer Voice Calling - Frontend Tech Spec

This document details the frontend implementation required for the P2P voice calling feature. The backend signaling and STOMP routing are already implemented.

## 1. Hook: `useVoiceCall`

### State Machine
The call feature operates on a state machine with the following states:
*   `idle`: User is not in a call.
*   `calling`: User initiated a call and is waiting for an answer. State transitions to `connected` upon `CALL_ACCEPT`, or back to `idle` upon `CALL_DECLINE` or `CALL_TIMEOUT`.
*   `ringing`: User is receiving an incoming call. State transitions to `connected` if answered, or `idle` if declined or timed out.
*   `connected`: Active WebRTC connection. State transitions to `ended` and then `idle` upon `CALL_HANGUP`.
*   `ended`: Brief intermediary state to show call ended UI before returning to `idle`.

### STOMP Events (/user/queue/signal)
You must handle these payload types:
*   `CALL_INITIATE`: Transition to `ringing`, store caller info.
*   `CALL_ACCEPT`: Transition to `connected`, establish WebRTC.
*   `CALL_DECLINE`: Transition to `idle`, show "Call declined" toast.
*   `CALL_HANGUP`: Transition to `ended`, tear down WebRTC.
*   `CALL_TIMEOUT`: Transition to `idle`, cancel ongoing `ringing` / `calling`.
*   `WEBRTC_OFFER`: Store the remote offer, buffer until WebRTC initialized.
*   `WEBRTC_ANSWER`: Pass answer to `RTCPeerConnection.setRemoteDescription`.
*   `WEBRTC_ICE_CANDIDATE`: Pass ICE candidate to `RTCPeerConnection.addIceCandidate`.

### Sending Signals (/app/signal)
*   **Initiate:** Send `CALL_INITIATE` to recipient.
*   **Accept:** Send `CALL_ACCEPT` to caller.
*   **Decline:** Send `CALL_DECLINE` to caller.
*   **Hangup:** Send `CALL_HANGUP` to the other party.

### WebRTC Sequence
1.  **Media Request:** Call `navigator.mediaDevices.getUserMedia({ audio: true })`.
2.  **Offer Creation:** The *caller* creates the `RTCSessionDescription` offer, calls `setLocalDescription`, and sends it via STOMP (`WEBRTC_OFFER`).
3.  **Answer Creation:** The *callee* receives the offer, calls `setRemoteDescription`, creates an answer, calls `setLocalDescription`, and sends it (`WEBRTC_ANSWER`).
4.  **ICE Candidates:** Both sides listen to `onicecandidate` and send candidates via STOMP (`WEBRTC_ICE_CANDIDATE`).
5.  **Buffering:** Buffer incoming ICE candidates received *before* `setRemoteDescription` completes, then add them once it's done.

## 2. Component: `IncomingCallModal`

### Props
*   `caller`: User object of the person calling.
*   `onAccept`: Function mapped to hook's accept method.
*   `onDecline`: Function mapped to hook's decline method.

### UI States
*   Triggered when `state === 'ringing'`.
*   Shows Caller Avatar, Name, and "Accept" (Green) / "Decline" (Red) buttons.

## 3. Component: `ActiveCallBar`

### Props
*   `peer`: User object of the person in the call.
*   `onHangUp`: Function mapped to hook's hangup method.
*   `toggleMute`: Function mapped to track muting.

### Behavior
*   **Timer:** A live `setInterval` showing `MM:SS` duration of the current connection.
*   **Mute:** Retrieve the audio track via `stream.getAudioTracks()[0]`. Set `track.enabled = false` to mute. This stops audio collection; no STOMP message is needed.
*   **Cleanup Phase:** Upon Hang Up or receiving `CALL_HANGUP`:
    1.  Call `peerConnection.close()`.
    2.  Stop all tracks: `stream.getTracks().forEach(t => t.stop())`.
    3.  Reset hook state.

## 4. Component: `OutgoingCallModal`

### Props
*   `recipient`: User object of the person being called.
*   `onCancel`: Function to cancel call midway.

### UI States
*   Triggered when `state === 'calling'`.
*   Shows a "Calling User..." status.
*   A countdown timer dropping from 30s.

## 5. Integration Guide

### Architecture
Use a context provider `VoiceCallProvider` wrapped around the main layout so that incoming calls act globally, decoupled from the current page. Modals like `IncomingCallModal` should be rendered via React Portals or placed high in the DOM hierarchy with absolute positioning and high `z-index`.

### Call Initiation
A placeholder "Call" button has already been added to the header of the Active DM view (`app/(app)/channels/me/page.tsx`). 
- Look for the button with the `<Phone />` icon and replace its `onClick` placeholder alert.
- Wire this button to call your new `initiateCall(selectedUserId)` hook.
- Avoid initiating if another call is ringing/active by checking the hook state before dispatching.

### Edge Cases
*   **Busy Signal:** If already in a call and someone initiates, either return `CALL_DECLINE` automatically or ignore the incoming initiate message.
*   **Tab Close:** Hook `beforeunload` window event to send `CALL_HANGUP` if a connection is active when closing.
*   **Audio Output:** Ensure the received remote audio stream is bound to a hidden or non-obstructive `<audio autoPlay />` tag in the DOM.
