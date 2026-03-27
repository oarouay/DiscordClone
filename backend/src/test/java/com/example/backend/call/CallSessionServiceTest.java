package com.example.backend.call;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
public class CallSessionServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private CallSessionService callSessionService;

    @BeforeEach
    void setUp() {
        callSessionService = new CallSessionService(messagingTemplate);
    }

    @Test
    void testCreateAndGetSession() {
        callSessionService.createSession("userA", "userB");
        
        CallSessionService.CallSession session = callSessionService.getSession("userB", "userA"); // Test reverse lookup
        assertNotNull(session, "Session should be created");
        assertTrue(
            (session.getParticipantA().equals("userA") && session.getParticipantB().equals("userB")) ||
            (session.getParticipantA().equals("userB") && session.getParticipantB().equals("userA"))
        );
    }

    @Test
    void testEndSession() {
        callSessionService.createSession("user1", "user2");
        assertNotNull(callSessionService.getSession("user1", "user2"));

        callSessionService.endSession("user2", "user1");
        assertNull(callSessionService.getSession("user1", "user2"), "Session should be removed");
    }

    @Test
    void testSweepStaleSessions_removesOldSessionsAndNotifies() throws Exception {
        // Create an old session using reflection to test timeout logic
        CallSessionService.CallSession oldSession = new CallSessionService.CallSession("user1", "user2", Instant.now().minusSeconds(40));
        CallSessionService.CallSession freshSession = new CallSessionService.CallSession("user3", "user4", Instant.now().minusSeconds(10));

        Map<String, CallSessionService.CallSession> activeSessions = new ConcurrentHashMap<>();
        activeSessions.put("user1:user2", oldSession);
        activeSessions.put("user3:user4", freshSession);

        ReflectionTestUtils.setField(callSessionService, "activeSessions", activeSessions);

        callSessionService.sweepStaleSessions();

        // Fresh session should remain
        assertEquals(1, activeSessions.size());
        assertTrue(activeSessions.containsKey("user3:user4"));

        // Verify that timeout messages were sent for the old session
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq("user1"), eq("/queue/signal"), any(SignalingMessageDTO.class) // sender side
        );
        verify(messagingTemplate, times(1)).convertAndSendToUser(
                eq("user2"), eq("/queue/signal"), any(SignalingMessageDTO.class) // recipient side
        );
    }
}
