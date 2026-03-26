package com.example.backend.dm.dto;

import com.example.backend.user.dto.UserResponse;
import java.time.Instant;

public record DirectMessageConversationResponse(
        String channelId,
        UserResponse user,
        String lastMessage,
        Instant lastMessageAt
) {
}
