package com.example.backend.friend.dto;

import com.example.backend.user.dto.UserResponse;
import java.time.Instant;

public record FriendResponse(
        UserResponse user,
        Instant friendsSince
) {
}
