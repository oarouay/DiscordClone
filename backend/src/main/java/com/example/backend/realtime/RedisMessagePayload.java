package com.example.backend.realtime;

import com.example.backend.dm.dto.DirectMessageResponse;

public record RedisMessagePayload(
        String targetUserId,
        DirectMessageResponse message
) {}
