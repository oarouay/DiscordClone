package com.example.backend.channel.dto;

import com.example.backend.channel.model.ChannelMessageEntity;
import com.example.backend.user.dto.UserResponse;
import java.time.Instant;

public record ChannelMessageResponse(
        String id,
        String channelId,
        UserResponse sender,
        String content,
        Instant createdAt,
        Instant editedAt
) {
    public static ChannelMessageResponse fromEntity(ChannelMessageEntity entity) {
        return new ChannelMessageResponse(
                entity.getId(),
                entity.getChannel().getId(),
                UserResponse.fromEntity(entity.getSender()),
                entity.getContent(),
                entity.getCreatedAt(),
                entity.getEditedAt()
        );
    }
}
