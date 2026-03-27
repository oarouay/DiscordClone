package com.example.backend.call;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
public class CallSignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CallSessionService callSessionService;
    // private final FriendshipService friendshipService; // Assume injected

    public CallSignalingController(SimpMessagingTemplate messagingTemplate, CallSessionService callSessionService) {
        this.messagingTemplate = messagingTemplate;
        this.callSessionService = callSessionService;
    }

    @MessageMapping("/signal")
    public void handleSignal(@Payload SignalingMessageDTO message, Principal principal, SimpMessageHeaderAccessor headerAccessor) {
        // 1. Security check: User can only send signals on their own behalf
        if (principal == null || !principal.getName().equals(message.getSenderId())) {
            throw new SecurityException("Unauthorized: senderId does not match current user");
        }

        // 2. Friendship validation (commented placeholder, assuming it exists)
        // if (!friendshipService.areFriends(message.getSenderId(), message.getRecipientId())) {
        //    throw new IllegalArgumentException("Cannot call non-friends");
        // }

        // 3. Handle session state
        switch (message.getType()) {
            case CALL_INITIATE:
                callSessionService.createSession(message.getSenderId(), message.getRecipientId());
                break;
            case CALL_DECLINE:
            case CALL_HANGUP:
                callSessionService.endSession(message.getSenderId(), message.getRecipientId());
                break;
            default:
                break;
        }

        // 4. Route message to recipient
        messagingTemplate.convertAndSendToUser(
                message.getRecipientId(),
                "/queue/signal",
                message
        );
    }
}
