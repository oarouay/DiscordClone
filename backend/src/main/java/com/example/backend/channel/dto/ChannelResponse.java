package com.example.backend.channel.dto;

import com.example.backend.channel.model.ChannelEntity;
import com.example.backend.channel.model.ChannelType;
import java.time.Instant;

public record ChannelResponse(
        String id,
        String guildId,
        String name,
        ChannelType type,
        String category,
        int position,
        Instant createdAt
) {
    public static ChannelResponse fromEntity(ChannelEntity entity) {
        return new ChannelResponse(
                entity.getId(),
                entity.getGuild().getId(),
                entity.getName(),
                entity.getType(),
                entity.getCategory(),
                entity.getPosition(),
                entity.getCreatedAt()
        );
    }
}