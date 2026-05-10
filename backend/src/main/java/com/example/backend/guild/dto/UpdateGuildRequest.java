package com.example.backend.guild.dto;

public record UpdateGuildRequest(
        String name,
        String description,
        String iconUrl
) {}