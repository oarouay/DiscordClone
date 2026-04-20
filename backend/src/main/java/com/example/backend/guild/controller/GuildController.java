package com.example.backend.guild.controller;

import com.example.backend.guild.dto.GuildCreateRequest;
import com.example.backend.guild.dto.GuildResponse;
import com.example.backend.guild.model.GuildEntity;
import com.example.backend.guild.service.GuildService;
import com.example.backend.user.model.UserEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guilds")
public class GuildController {

    private final GuildService guildService;

    public GuildController(GuildService guildService) {
        this.guildService = guildService;
    }

    @PostMapping
    public ResponseEntity<GuildResponse> createGuild(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody GuildCreateRequest request) {
        GuildEntity guild = guildService.createGuild(currentUser, request.name(), request.iconUrl());
        return ResponseEntity.ok(GuildResponse.fromEntity(guild));
    }
}
