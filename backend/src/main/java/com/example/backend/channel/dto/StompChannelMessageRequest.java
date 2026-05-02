package com.example.backend.channel.dto;

import jakarta.validation.constraints.NotBlank;

public record StompChannelMessageRequest(
        @NotBlank(message = "Content cannot be blank")
        String content
) {
}
