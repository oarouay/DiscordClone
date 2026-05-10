package com.example.backend.channel.controller;

import com.example.backend.channel.dto.ChannelMessageResponse;
import com.example.backend.channel.dto.ChannelResponse;
import com.example.backend.channel.dto.CreateChannelRequest;
import com.example.backend.channel.dto.UpdateChannelRequest;
import com.example.backend.channel.service.ChannelService;
import com.example.backend.user.model.UserEntity;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/guilds/{guildId}/channels")
public class ChannelController {

    private final ChannelService channelService;

    public ChannelController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @PostMapping
    public ResponseEntity<ChannelResponse> createChannel(
            @PathVariable String guildId,
            @Valid @RequestBody CreateChannelRequest request) {
        var channel = channelService.createChannel(guildId, request);
        return ResponseEntity.ok(ChannelResponse.fromEntity(channel));
    }

    @GetMapping
    public ResponseEntity<List<ChannelResponse>> listChannels(@PathVariable String guildId) {
        var channels = channelService.listChannelsForGuild(guildId);
        return ResponseEntity.ok(channels.stream().map(ChannelResponse::fromEntity).toList());
    }

    @PutMapping("/{channelId}")
    public ResponseEntity<ChannelResponse> updateChannel(
            @PathVariable String guildId,
            @PathVariable String channelId,
            @Valid @RequestBody UpdateChannelRequest request) {
        var channel = channelService.updateChannel(channelId, request);
        return ResponseEntity.ok(ChannelResponse.fromEntity(channel));
    }

    @DeleteMapping("/{channelId}")
    public ResponseEntity<Void> deleteChannel(
            @PathVariable String guildId,
            @PathVariable String channelId) {
        channelService.deleteChannel(channelId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{channelId}/messages")
    public ResponseEntity<List<ChannelMessageResponse>> getMessages(
            @PathVariable String guildId,
            @PathVariable String channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        var messages = channelService.getChannelMessages(channelId, page, size);
        return ResponseEntity.ok(messages.stream().map(ChannelMessageResponse::fromEntity).toList());
    }

    @PostMapping("/{channelId}/messages")
    public ResponseEntity<ChannelMessageResponse> sendMessage(
            @PathVariable String guildId,
            @PathVariable String channelId,
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody com.example.backend.channel.dto.StompChannelMessageRequest request) {
        var message = channelService.createMessage(channelId, currentUser, request.content());
        return ResponseEntity.ok(ChannelMessageResponse.fromEntity(message));
    }
}