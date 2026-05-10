package com.example.backend.guild.controller;

import com.example.backend.guild.dto.*;
import com.example.backend.guild.model.GuildEntity;
import com.example.backend.guild.service.GuildService;
import com.example.backend.user.model.UserEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
        GuildEntity guild = guildService.createGuild(currentUser, request);
        return ResponseEntity.ok(GuildResponse.fromEntity(guild));
    }

    @GetMapping("/me")
    public ResponseEntity<List<GuildResponse>> listMyGuilds(
            @AuthenticationPrincipal UserEntity currentUser) {
        List<GuildResponse> guilds = guildService.listGuildsForUser(currentUser);
        return ResponseEntity.ok(guilds);
    }

    @GetMapping("/{guildId}")
    public ResponseEntity<GuildResponse> getGuild(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId) {
        GuildResponse guild = guildService.getGuildDetails(guildId, currentUser);
        return ResponseEntity.ok(guild);
    }

    @PutMapping("/{guildId}")
    public ResponseEntity<GuildResponse> updateGuild(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId,
            @RequestBody UpdateGuildRequest request) {
        GuildResponse guild = guildService.updateGuild(guildId, currentUser, request);
        return ResponseEntity.ok(guild);
    }

    @DeleteMapping("/{guildId}")
    public ResponseEntity<Void> deleteGuild(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId) {
        guildService.deleteGuild(guildId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{guildId}/leave")
    public ResponseEntity<Void> leaveGuild(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId) {
        guildService.leaveGuild(guildId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{guildId}/invite")
    public ResponseEntity<InviteResponse> generateInvite(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId) {
        InviteResponse invite = guildService.generateInvite(guildId, currentUser);
        return ResponseEntity.ok(invite);
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<GuildResponse> joinGuild(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String inviteCode) {
        GuildResponse guild = guildService.joinGuild(inviteCode, currentUser);
        return ResponseEntity.ok(guild);
    }

    @GetMapping("/{guildId}/members")
    public ResponseEntity<List<GuildMemberResponse>> listMembers(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId) {
        List<GuildMemberResponse> members = guildService.listMembers(guildId, currentUser);
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{guildId}/members/{userId}")
    public ResponseEntity<Void> kickMember(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable String guildId,
            @PathVariable String userId) {
        guildService.kickMember(guildId, userId, currentUser);
        return ResponseEntity.noContent().build();
    }
}