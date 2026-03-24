package com.example.backend.auth.dto;

import com.example.backend.user.dto.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}

