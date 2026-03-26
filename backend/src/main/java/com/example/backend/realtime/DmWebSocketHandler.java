package com.example.backend.realtime;

import com.example.backend.auth.security.AppUserDetailsService;
import com.example.backend.auth.security.AppUserPrincipal;
import com.example.backend.auth.security.JwtService;
import com.example.backend.common.dto.ErrorResponse;
import com.example.backend.common.exception.UnauthorizedException;
import com.example.backend.dm.dto.DirectMessageResponse;
import com.example.backend.dm.service.DirectMessageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class DmWebSocketHandler extends TextWebSocketHandler {

    private static final String ATTR_USER_ID = "uid";

    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private final AppUserDetailsService appUserDetailsService;
    private final DirectMessageService directMessageService;
    private final WebSocketSessionRegistry sessionRegistry;

    public DmWebSocketHandler(
            ObjectMapper objectMapper,
            JwtService jwtService,
            AppUserDetailsService appUserDetailsService,
            DirectMessageService directMessageService,
            WebSocketSessionRegistry sessionRegistry
    ) {
        this.objectMapper = objectMapper;
        this.jwtService = jwtService;
        this.appUserDetailsService = appUserDetailsService;
        this.directMessageService = directMessageService;
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode root = objectMapper.readTree(message.getPayload());
        String type = root.path("type").asText("");

        switch (type) {
            case "auth" -> handleAuth(session, root);
            case "message" -> handleDirectMessage(session, root);
            case "subscribe" -> {
                // The frontend currently uses subscribe optionally; no-op keeps compatibility.
            }
            default -> sendError(session, "Unsupported WebSocket event type");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = resolveAuthenticatedUserId(session);
        if (userId != null) {
            sessionRegistry.unregister(userId, session);
        }
    }

    private void handleAuth(WebSocketSession session, JsonNode root) throws Exception {
        String token = root.path("token").asText("");
        if (token.isBlank()) {
            sendError(session, "Missing token");
            return;
        }

        try {
            String email = jwtService.extractEmail(token);
            AppUserPrincipal principal = (AppUserPrincipal) appUserDetailsService.loadUserByUsername(email);

            if (!jwtService.isTokenValid(token, principal)) {
                throw new UnauthorizedException("Invalid or expired token");
            }

            session.getAttributes().put(ATTR_USER_ID, principal.getId());
            sessionRegistry.register(principal.getId(), session);
            sendEnvelope(session, "auth", Map.of("success", true));
        } catch (RuntimeException ex) {
            sendError(session, "Invalid or expired token");
        }
    }

    private void handleDirectMessage(WebSocketSession session, JsonNode root) throws Exception {
        String senderId = resolveAuthenticatedUserId(session);
        if (senderId == null) {
            sendError(session, "Authenticate before sending messages");
            return;
        }

        String channelId = root.path("channelId").asText("");
        String content = root.path("content").asText("").trim();

        if (!channelId.startsWith("dm_")) {
            sendError(session, "Invalid channel id");
            return;
        }
        if (content.isBlank()) {
            sendError(session, "Message content is required");
            return;
        }

        String recipientId = channelId.substring(3);
        DirectMessageResponse senderResponse = directMessageService.sendMessage(senderId, recipientId, content);
        // Broadcasting is now handled by DirectMessageBroadcastListener via ApplicationEvent.
    }

    private String resolveAuthenticatedUserId(WebSocketSession session) {
        Object userId = session.getAttributes().get(ATTR_USER_ID);
        return userId instanceof String value ? value : null;
    }

    private void sendError(WebSocketSession session, String message) throws Exception {
        if (!session.isOpen()) {
            return;
        }
        sendEnvelope(session, "error", new ErrorResponse(message));
    }

    private void sendEnvelope(WebSocketSession session, String type, Object payload) throws Exception {
        if (!session.isOpen()) {
            return;
        }
        String json = objectMapper.writeValueAsString(Map.of("type", type, "payload", payload));
        session.sendMessage(new TextMessage(json));
    }
}
