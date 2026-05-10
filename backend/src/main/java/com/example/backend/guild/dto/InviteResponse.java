package com.example.backend.guild.dto;

import java.time.Instant;

public record InviteResponse(
        String inviteCode,
        Instant expiresAt
) {}