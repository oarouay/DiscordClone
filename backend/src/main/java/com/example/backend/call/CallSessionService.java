package com.example.backend.call;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CallSessionService {

    private final SimpMessagingTemplate messagingTemplate;
    
    // callId (senderId + ":" + recipientId) -> CallSession
    private final Map<String, CallSession> activeSessions = new ConcurrentHashMap<>();

    public CallSessionService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void createSession(String senderId, String recipientId) {
        String callId = generateCallId(senderId, recipientId);
        activeSessions.put(callId, new CallSession(senderId, recipientId, Instant.now()));
    }

    public void endSession(String senderId, String recipientId) {
        String callId = generateCallId(senderId, recipientId);
        activeSessions.remove(callId);
    }
    
    public CallSession getSession(String senderId, String recipientId) {
        return activeSessions.get(generateCallId(senderId, recipientId));
    }

    // Runs every 5 seconds to sweep timed-out INITIATING calls
    @Scheduled(fixedRate = 5000)
    public void sweepStaleSessions() {
        Instant now = Instant.now();
        activeSessions.entrySet().removeIf(entry -> {
            CallSession session = entry.getValue();
            // 30 seconds timeout
            if (session.getStartTime().plusSeconds(30).isBefore(now)) {
                // Determine timeout message
                SignalingMessageDTO timeoutMsg = new SignalingMessageDTO();
                timeoutMsg.setType(SignalingMessageDTO.Type.CALL_TIMEOUT);
                timeoutMsg.setSenderId(session.getParticipantA());
                timeoutMsg.setRecipientId(session.getParticipantB());
                
                // Notify both parties
                messagingTemplate.convertAndSendToUser(session.getParticipantA(), "/queue/signal", timeoutMsg);
                messagingTemplate.convertAndSendToUser(session.getParticipantB(), "/queue/signal", timeoutMsg);
                
                return true; // remove from map
            }
            return false;
        });
    }

    private String generateCallId(String user1, String user2) {
        // Enforce consistent ID regardless of who called whom
        return user1.compareTo(user2) < 0 ? user1 + ":" + user2 : user2 + ":" + user1;
    }

    public static class CallSession {
        private String participantA;
        private String participantB;
        private Instant startTime;

        public CallSession(String participantA, String participantB, Instant startTime) {
            this.participantA = participantA;
            this.participantB = participantB;
            this.startTime = startTime;
        }

        public String getParticipantA() { return participantA; }
        public String getParticipantB() { return participantB; }
        public Instant getStartTime() { return startTime; }
    }
}
