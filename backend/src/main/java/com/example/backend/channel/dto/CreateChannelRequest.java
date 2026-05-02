package com.example.backend.channel.dto;

import com.example.backend.channel.model.ChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateChannelRequest(
        @NotBlank(message = "Channel name is required")
        String name,
        
        @NotNull(message = "Channel type is required")
        ChannelType type
) {
}
