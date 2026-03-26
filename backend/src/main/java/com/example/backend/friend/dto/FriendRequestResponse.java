package com.example.backend.friend.dto;

import com.example.backend.friend.model.FriendRequestEntity;
import com.example.backend.friend.model.FriendRequestStatus;
import com.example.backend.user.dto.UserResponse;
import java.time.Instant;

public record FriendRequestResponse(
        String id,
        UserResponse requester,
        UserResponse receiver,
        FriendRequestStatus status,
        Instant createdAt,
        Instant respondedAt
) {
    public static FriendRequestResponse fromEntity(FriendRequestEntity entity) {
        return new FriendRequestResponse(
                entity.getId(),
                UserResponse.fromEntity(entity.getRequester()),
                UserResponse.fromEntity(entity.getReceiver()),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getRespondedAt()
        );
    }
}
