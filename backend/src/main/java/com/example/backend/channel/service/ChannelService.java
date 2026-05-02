package com.example.backend.channel.service;

import com.example.backend.channel.model.ChannelEntity;
import com.example.backend.channel.model.ChannelMessageEntity;
import com.example.backend.channel.model.ChannelType;
import com.example.backend.channel.repository.ChannelMessageRepository;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.common.exception.NotFoundException;
import com.example.backend.guild.model.GuildEntity;
import com.example.backend.guild.repository.GuildRepository;
import com.example.backend.user.model.UserEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelMessageRepository channelMessageRepository;
    private final GuildRepository guildRepository;

    public ChannelService(ChannelRepository channelRepository, ChannelMessageRepository channelMessageRepository, GuildRepository guildRepository) {
        this.channelRepository = channelRepository;
        this.channelMessageRepository = channelMessageRepository;
        this.guildRepository = guildRepository;
    }

    @Transactional
    public ChannelEntity createChannel(String guildId, String name, ChannelType type) {
        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        ChannelEntity channel = new ChannelEntity();
        channel.setId(UUID.randomUUID().toString());
        channel.setGuild(guild);
        channel.setName(name.toLowerCase().replace(" ", "-"));
        channel.setType(type);
        channel.setCreatedAt(Instant.now());

        return channelRepository.save(channel);
    }

    @Transactional(readOnly = true)
    public List<ChannelEntity> listChannelsForGuild(String guildId) {
        return channelRepository.findByGuildIdOrderByCreatedAtAsc(guildId);
    }

    @Transactional(readOnly = true)
    public List<ChannelMessageEntity> getChannelMessages(String channelId, int page, int size) {
        if (!channelRepository.existsById(channelId)) {
            throw new NotFoundException("Channel not found");
        }
        
        List<ChannelMessageEntity> messages = channelMessageRepository
                .findByChannelIdOrderByCreatedAtDesc(channelId, PageRequest.of(page, size))
                .getContent();
        
        List<ChannelMessageEntity> modifiableMessages = new java.util.ArrayList<>(messages);
        java.util.Collections.reverse(modifiableMessages);
        return modifiableMessages;
    }

    @Transactional
    public ChannelMessageEntity createMessage(String channelId, UserEntity sender, String content) {
        ChannelEntity channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new NotFoundException("Channel not found"));

        ChannelMessageEntity message = new ChannelMessageEntity();
        message.setId(UUID.randomUUID().toString());
        message.setChannel(channel);
        message.setSender(sender);
        message.setContent(content.trim());
        message.setCreatedAt(Instant.now());

        return channelMessageRepository.save(message);
    }
}
