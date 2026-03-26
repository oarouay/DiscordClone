package com.example.backend.friend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateFriendRequest(
        @NotBlank(message = "Target user id is required")
        String targetUserId
) {
}
