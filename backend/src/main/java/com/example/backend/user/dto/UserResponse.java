package com.example.backend.user.dto;

import com.example.backend.user.model.UserEntity;
import com.example.backend.user.model.UserStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponse(
        String id,
        String username,
        String displayName,
        String email,
        UserStatus status,
        String avatarUrl
) {
    public static UserResponse fromEntity(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getEmail(),
                user.getStatus(),
                user.getAvatarUrl()
        );
    }
}

