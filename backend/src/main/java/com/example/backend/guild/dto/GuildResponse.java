package com.example.backend.guild.dto;

import com.example.backend.guild.model.GuildEntity;
import com.example.backend.user.dto.UserResponse;

import java.time.Instant;

public record GuildResponse(
        String id,
        String name,
        String iconUrl,
        UserResponse owner,
        Instant createdAt
) {
    public static GuildResponse fromEntity(GuildEntity entity) {
        return new GuildResponse(
                entity.getId(),
                entity.getName(),
                entity.getIconUrl(),
                UserResponse.fromEntity(entity.getOwner()),
                entity.getCreatedAt()
        );
    }
}
