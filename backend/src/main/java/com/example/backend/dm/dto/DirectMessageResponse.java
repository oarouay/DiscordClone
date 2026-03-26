package com.example.backend.dm.dto;

import com.example.backend.dm.model.DirectMessageEntity;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.model.UserEntity;
import java.time.Instant;

public record DirectMessageResponse(
        String id,
        String channelId,
        UserResponse author,
        String content,
        Instant createdAt,
        Instant editedAt
) {
    public static DirectMessageResponse fromEntity(DirectMessageEntity entity, UserEntity viewer) {
        return fromEntity(entity, viewer, entity.getContent());
    }

    public static DirectMessageResponse fromEntity(
            DirectMessageEntity entity,
            UserEntity viewer,
            String clearContent
    ) {
        UserEntity otherUser = entity.getSender().getId().equals(viewer.getId())
                ? entity.getRecipient()
                : entity.getSender();

        return new DirectMessageResponse(
                entity.getId(),
                "dm_" + otherUser.getId(),
                UserResponse.fromEntity(entity.getSender()),
                clearContent,
                entity.getCreatedAt(),
                entity.getEditedAt()
        );
    }
}
