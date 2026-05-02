package com.example.backend.channel.controller;

import com.example.backend.channel.dto.ChannelMessageResponse;
import com.example.backend.channel.dto.StompChannelMessageRequest;
import com.example.backend.channel.model.ChannelMessageEntity;
import com.example.backend.channel.service.ChannelService;
import com.example.backend.user.model.UserEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
public class ChannelMessageWebSocketController {

    private final ChannelService channelService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChannelMessageWebSocketController(ChannelService channelService, SimpMessagingTemplate messagingTemplate) {
        this.channelService = channelService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/channels/{channelId}/messages")
    public void sendMessage(
            @DestinationVariable String channelId,
            @Payload StompChannelMessageRequest request,
            Authentication authentication) {
        
        // Extract sender from STOMP authentication
        UserEntity sender = (UserEntity) authentication.getPrincipal();

        // Persist message to database via ChannelService
        ChannelMessageEntity savedMessage = channelService.createMessage(channelId, sender, request.content());
        ChannelMessageResponse response = ChannelMessageResponse.fromEntity(savedMessage);

        // Broadcast to all clients subscribed to this channel's topic
        messagingTemplate.convertAndSend("/topic/channels." + channelId, response);
    }
}
