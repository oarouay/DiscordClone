package com.example.backend.call;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.security.Principal;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CallSignalingControllerTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private CallSessionService callSessionService;

    @Mock
    private com.example.backend.friend.service.FriendService friendService;

    private CallSignalingController controller;

    @BeforeEach
    void setUp() {
        controller = new CallSignalingController(messagingTemplate, callSessionService, friendService);
    }

    @Test
    void handleSignal_unauthorizedSender_throwsSecurityException() {
        SignalingMessageDTO dto = new SignalingMessageDTO();
        dto.setSenderId("userA");
        
        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("userB");
        
        SimpMessageHeaderAccessor headerAccessor = mock(SimpMessageHeaderAccessor.class);

        assertThrows(SecurityException.class, () -> controller.handleSignal(dto, principal, headerAccessor));
    }
    
    @Test
    void handleSignal_Initiate_createsSessionAndRoutes() {
        SignalingMessageDTO dto = new SignalingMessageDTO();
        dto.setType(SignalingMessageDTO.Type.CALL_INITIATE);
        dto.setSenderId("userA");
        dto.setRecipientId("userB");

        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("userA");

        SimpMessageHeaderAccessor headerAccessor = mock(SimpMessageHeaderAccessor.class);
        
        when(friendService.areFriends("userA", "userB")).thenReturn(true);

        controller.handleSignal(dto, principal, headerAccessor);

        // Verify session creation
        verify(callSessionService, times(1)).createSession("userA", "userB");

        // Verify routing
        verify(messagingTemplate, times(1)).convertAndSendToUser("userB", "/queue/signal", dto);
    }

    @Test
    void handleSignal_Hangup_endsSessionAndRoutes() {
        SignalingMessageDTO dto = new SignalingMessageDTO();
        dto.setType(SignalingMessageDTO.Type.CALL_HANGUP);
        dto.setSenderId("userA");
        dto.setRecipientId("userB");

        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("userA");

        SimpMessageHeaderAccessor headerAccessor = mock(SimpMessageHeaderAccessor.class);

        when(friendService.areFriends("userA", "userB")).thenReturn(true);

        controller.handleSignal(dto, principal, headerAccessor);

        // Verify session end
        verify(callSessionService, times(1)).endSession("userA", "userB");

        // Verify routing
        verify(messagingTemplate, times(1)).convertAndSendToUser("userB", "/queue/signal", dto);
    }

    @Test
    void handleSignal_notFriends_throwsIllegalArgumentException() {
        SignalingMessageDTO dto = new SignalingMessageDTO();
        dto.setType(SignalingMessageDTO.Type.CALL_INITIATE);
        dto.setSenderId("userA");
        dto.setRecipientId("userB");

        Principal principal = mock(Principal.class);
        when(principal.getName()).thenReturn("userA");

        SimpMessageHeaderAccessor headerAccessor = mock(SimpMessageHeaderAccessor.class);

        when(friendService.areFriends("userA", "userB")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> controller.handleSignal(dto, principal, headerAccessor));
    }
}
