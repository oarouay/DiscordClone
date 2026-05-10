package com.example.backend.guild.dto;

import com.example.backend.guild.model.GuildType;
import jakarta.validation.constraints.NotBlank;

public record GuildCreateRequest(
        @NotBlank(message = "Guild name is required")
        String name,
        String description,
        String iconUrl,
        GuildType guildType
) {}