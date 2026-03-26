package com.example.backend.realtime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.auth.security.AppUserDetailsService;
import com.example.backend.auth.security.AppUserPrincipal;
import com.example.backend.auth.security.JwtService;
import com.example.backend.dm.dto.DirectMessageResponse;
import com.example.backend.dm.service.DirectMessageService;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.model.UserStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@ExtendWith(MockitoExtension.class)
class DmWebSocketHandlerTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private AppUserDetailsService appUserDetailsService;

    @Mock
    private DirectMessageService directMessageService;

    @Mock
    private WebSocketSessionRegistry sessionRegistry;

    @Mock
    private WebSocketSession session;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private DmWebSocketHandler handler;
    private Map<String, Object> sessionAttributes;

    @BeforeEach
    void setUp() {
        handler = new DmWebSocketHandler(
                objectMapper,
                jwtService,
                appUserDetailsService,
                directMessageService,
                sessionRegistry
        );

        sessionAttributes = new HashMap<>();
        when(session.getAttributes()).thenReturn(sessionAttributes);
        when(session.isOpen()).thenReturn(true);
    }

    @Test
    void authRegistersSessionAndAcknowledges() throws Exception {
        UserEntity sender = buildUser("u_sender", "sender@example.com", "sender", "Sender");
        AppUserPrincipal principal = new AppUserPrincipal(sender);

        when(jwtService.extractEmail("good-token")).thenReturn(sender.getEmail());
        when(appUserDetailsService.loadUserByUsername(sender.getEmail())).thenReturn(principal);
        when(jwtService.isTokenValid("good-token", principal)).thenReturn(true);

        handler.handleTextMessage(session, new TextMessage("""
                {"type":"auth","token":"good-token"}
                """));

        assertEquals("u_sender", sessionAttributes.get("uid"));
        verify(sessionRegistry).register("u_sender", session);

        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session).sendMessage(messageCaptor.capture());
        assertTrue(messageCaptor.getValue().getPayload().contains("\"type\":\"auth\""));
        assertTrue(messageCaptor.getValue().getPayload().contains("\"success\":true"));
    }

    @Test
    void messageFanoutUsesViewerSpecificChannelIds() throws Exception {
        UserEntity sender = buildUser("u_sender", "sender@example.com", "sender", "Sender");
        AppUserPrincipal principal = new AppUserPrincipal(sender);

        when(jwtService.extractEmail("good-token")).thenReturn(sender.getEmail());
        when(appUserDetailsService.loadUserByUsername(sender.getEmail())).thenReturn(principal);
        when(jwtService.isTokenValid("good-token", principal)).thenReturn(true);

        handler.handleTextMessage(session, new TextMessage("""
                {"type":"auth","token":"good-token"}
                """));

        DirectMessageResponse senderResponse = new DirectMessageResponse(
                "dm_msg_1",
                "dm_u_recipient",
                new UserResponse("u_sender", "sender", "Sender", "sender@example.com", UserStatus.ONLINE, null),
                "hello",
                null,
                null
        );
        when(directMessageService.sendMessage("u_sender", "u_recipient", "hello")).thenReturn(senderResponse);

        handler.handleTextMessage(session, new TextMessage("""
                {"type":"message","channelId":"dm_u_recipient","content":"hello"}
                """));

        verify(directMessageService).sendMessage("u_sender", "u_recipient", "hello");
    }

    @Test
    void unauthenticatedMessageReturnsError() throws Exception {
        handler.handleTextMessage(session, new TextMessage("""
                {"type":"message","channelId":"dm_u_recipient","content":"hello"}
                """));

        verify(directMessageService, never()).sendMessage(anyString(), anyString(), anyString());

        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(session, times(1)).sendMessage(messageCaptor.capture());
        String payload = messageCaptor.getValue().getPayload();
        assertTrue(payload.contains("\"type\":\"error\""));
        assertTrue(payload.contains("Authenticate before sending messages"));
    }

    private UserEntity buildUser(String id, String email, String username, String displayName) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setEmail(email);
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setPasswordHash("hash");
        user.setStatus(UserStatus.ONLINE);
        return user;
    }
}