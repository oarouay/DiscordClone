package com.example.backend.guild.controller;

import com.example.backend.auth.security.AppUserPrincipal;
import com.example.backend.guild.dto.*;
import com.example.backend.guild.model.GuildEntity;
import com.example.backend.guild.service.GuildService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guilds")
public class GuildController {

    private final GuildService guildService;

    public GuildController(GuildService guildService) {
        this.guildService = guildService;
    }

    @PostMapping
    public ResponseEntity<GuildResponse> createGuild(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestBody GuildCreateRequest request) {
        GuildResponse guild = guildService.createGuild(principal.getUser(), request);
        return ResponseEntity.ok(guild);
    }

    @GetMapping("/me")
    public ResponseEntity<List<GuildResponse>> listMyGuilds(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        List<GuildResponse> guilds = guildService.listGuildsForUser(principal.getUser());
        return ResponseEntity.ok(guilds);
    }

    @GetMapping("/{guildId}")
    public ResponseEntity<GuildResponse> getGuild(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId) {
        GuildResponse guild = guildService.getGuildDetails(guildId, principal.getUser());
        return ResponseEntity.ok(guild);
    }

    @PutMapping("/{guildId}")
    public ResponseEntity<GuildResponse> updateGuild(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId,
            @RequestBody UpdateGuildRequest request) {
        GuildResponse guild = guildService.updateGuild(guildId, principal.getUser(), request);
        return ResponseEntity.ok(guild);
    }

    @DeleteMapping("/{guildId}")
    public ResponseEntity<Void> deleteGuild(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId) {
        guildService.deleteGuild(guildId, principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{guildId}/leave")
    public ResponseEntity<Void> leaveGuild(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId) {
        guildService.leaveGuild(guildId, principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{guildId}/invite")
    public ResponseEntity<InviteResponse> generateInvite(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId) {
        InviteResponse invite = guildService.generateInvite(guildId, principal.getUser());
        return ResponseEntity.ok(invite);
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<GuildResponse> joinGuild(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String inviteCode) {
        GuildResponse guild = guildService.joinGuild(inviteCode, principal.getUser());
        return ResponseEntity.ok(guild);
    }

    @GetMapping("/{guildId}/members")
    public ResponseEntity<List<GuildMemberResponse>> listMembers(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId) {
        List<GuildMemberResponse> members = guildService.listMembers(guildId, principal.getUser());
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/{guildId}/members/{userId}")
    public ResponseEntity<Void> kickMember(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @PathVariable String guildId,
            @PathVariable String userId) {
        guildService.kickMember(guildId, userId, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}