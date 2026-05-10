package com.example.backend.guild.dto;

import com.example.backend.guild.model.GuildEntity;
import com.example.backend.guild.model.GuildType;
import com.example.backend.user.dto.UserResponse;

import java.time.Instant;

public record GuildResponse(
        String id,
        String name,
        String description,
        String iconUrl,
        String ownerId,
        GuildType guildType,
        boolean isPrivate,
        int memberCount,
        UserResponse owner,
        Instant createdAt
) {
    public static GuildResponse fromEntity(GuildEntity entity) {
        return new GuildResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIconUrl(),
                entity.getOwner().getId(),
                entity.getGuildType(),
                entity.isPrivate(),
                entity.getMembers().size(),
                UserResponse.fromEntity(entity.getOwner()),
                entity.getCreatedAt()
        );
    }
}