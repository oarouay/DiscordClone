package com.example.backend.guild.dto;

import com.example.backend.guild.model.GuildEntity;
import com.example.backend.guild.model.GuildMemberEntity;

import java.time.Instant;

public record GuildMemberResponse(
        String userId,
        String username,
        String displayName,
        String avatarUrl,
        String role,
        Instant joinedAt
) {
    public static GuildMemberResponse fromEntity(GuildMemberEntity member, GuildEntity guild) {
        String role = member.getUser().getId().equals(guild.getOwner().getId()) ? "OWNER" : "MEMBER";
        var user = member.getUser();
        return new GuildMemberResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                role,
                member.getJoinedAt()
        );
    }
}