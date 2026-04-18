package com.example.backend.dm.controller;

import com.example.backend.dm.dto.StompDirectMessageRequest;
import com.example.backend.dm.service.DirectMessageService;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.repository.UserRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
public class DirectMessageWebSocketController {

    private final DirectMessageService directMessageService;
    private final UserRepository userRepository;

    public DirectMessageWebSocketController(DirectMessageService directMessageService, UserRepository userRepository) {
        this.directMessageService = directMessageService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.message")
    public void handleDirectMessage(@Payload @Valid StompDirectMessageRequest request, Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new SecurityException("Unauthorized");
        }
        
        // principal.getName() is the user ID because StompUserPrincipal uses ID.
        String senderId = principal.getName();
        
        // The service automatically broadcasts via STOMP (we'll implement this next)
        directMessageService.sendMessage(senderId, request.recipientId(), request.content());
    }
}
