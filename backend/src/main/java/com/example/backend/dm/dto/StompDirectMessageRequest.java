package com.example.backend.dm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StompDirectMessageRequest(
        @NotBlank(message = "Recipient ID is required")
        String recipientId,

        @NotBlank(message = "Message content is required")
        @Size(max = 4000, message = "Message is too long")
        String content
) {
}
