package com.example.backend.channel.dto;

import com.example.backend.channel.model.ChannelType;

public record UpdateChannelRequest(
        String name,
        ChannelType type
) {}