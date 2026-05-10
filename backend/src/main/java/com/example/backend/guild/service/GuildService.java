package com.example.backend.guild.service;

import java.util.UUID;
import com.example.backend.common.exception.ConflictException;
import com.example.backend.common.exception.NotFoundException;
import com.example.backend.guild.dto.*;
import com.example.backend.guild.model.*;
import com.example.backend.guild.repository.GuildMemberRepository;
import com.example.backend.guild.repository.GuildRepository;
import com.example.backend.guild.repository.InviteRepository;
import com.example.backend.guild.repository.RoleRepository;
import com.example.backend.user.model.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GuildService {

    private final GuildRepository guildRepository;
    private final RoleRepository roleRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final InviteRepository inviteRepository;
    private final com.example.backend.channel.repository.ChannelRepository channelRepository;
    private final com.example.backend.channel.repository.ChannelMessageRepository channelMessageRepository;

    private static final String INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public GuildService(GuildRepository guildRepository, RoleRepository roleRepository,
                        GuildMemberRepository guildMemberRepository, InviteRepository inviteRepository,
                        com.example.backend.channel.repository.ChannelRepository channelRepository,
                        com.example.backend.channel.repository.ChannelMessageRepository channelMessageRepository) {
        this.guildRepository = guildRepository;
        this.roleRepository = roleRepository;
        this.guildMemberRepository = guildMemberRepository;
        this.inviteRepository = inviteRepository;
        this.channelRepository = channelRepository;
        this.channelMessageRepository = channelMessageRepository;
    }

    @Transactional
    public GuildResponse createGuild(UserEntity owner, GuildCreateRequest request) {
        GuildEntity guild = new GuildEntity();
        guild.setId(UUID.randomUUID().toString());
        guild.setOwner(owner);
        guild.setName(request.name());
        guild.setDescription(request.description());
        guild.setIconUrl(request.iconUrl());
        guild.setGuildType(request.guildType() != null ? request.guildType() : GuildType.HOUSE);
        guild.setPrivate(request.guildType() != null && request.guildType() == GuildType.HOUSE);
        guild.setCreatedAt(Instant.now());
        guild = guildRepository.save(guild);

        long everyonePermissions = GuildPermission.SEND_MESSAGES.getValue()
                | GuildPermission.VIEW_CHANNEL.getValue()
                | GuildPermission.READ_MESSAGE_HISTORY.getValue()
                | GuildPermission.CONNECT.getValue()
                | GuildPermission.SPEAK.getValue();

        RoleEntity everyoneRole = new RoleEntity();
        everyoneRole.setId(UUID.randomUUID().toString());
        everyoneRole.setGuild(guild);
        everyoneRole.setName("@everyone");
        everyoneRole.setColor("#99AAB5");
        everyoneRole.setPermissionsBitmask(everyonePermissions);
        everyoneRole.setPosition(0);
        everyoneRole.setHoist(false);
        everyoneRole = roleRepository.save(everyoneRole);

        RoleEntity ownerRole = new RoleEntity();
        ownerRole.setId(UUID.randomUUID().toString());
        ownerRole.setGuild(guild);
        ownerRole.setName("Owner");
        ownerRole.setColor("#FFD700");
        ownerRole.setPermissionsBitmask(GuildPermission.ADMINISTRATOR.getValue());
        ownerRole.setPosition(100);
        ownerRole.setHoist(true);
        ownerRole = roleRepository.save(ownerRole);

        GuildMemberEntity ownerMember = new GuildMemberEntity();
        ownerMember.setId(UUID.randomUUID().toString());
        ownerMember.setGuild(guild);
        ownerMember.setUser(owner);
        ownerMember.setJoinedAt(Instant.now());
        Set<RoleEntity> roles = new HashSet<>();
        roles.add(everyoneRole);
        roles.add(ownerRole);
        ownerMember.setRoles(roles);
        guildMemberRepository.save(ownerMember);

        return GuildResponse.fromEntity(guild);
    }

    @Transactional(readOnly = true)
    public List<GuildResponse> listGuildsForUser(UserEntity user) {
        return guildMemberRepository.findByUserId(user.getId())
                .stream()
                .map(GuildMemberEntity::getGuild)
                .map(GuildResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public GuildResponse getGuildDetails(String guildId, UserEntity user) {
        guildMemberRepository.findByGuildIdAndUserId(guildId, user.getId())
                .orElseThrow(() -> new NotFoundException("Guild not found or not a member"));

        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        return GuildResponse.fromEntity(guild);
    }

    @Transactional
    public GuildResponse updateGuild(String guildId, UserEntity user, UpdateGuildRequest request) {
        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        if (!guild.getOwner().getId().equals(user.getId())) {
            throw new com.example.backend.common.exception.UnauthorizedException("Only the owner can update this guild");
        }

        if (request.name() != null && !request.name().isBlank()) {
            guild.setName(request.name());
        }
        if (request.description() != null) {
            guild.setDescription(request.description());
        }
        if (request.iconUrl() != null) {
            guild.setIconUrl(request.iconUrl());
        }

        guild = guildRepository.save(guild);
        return GuildResponse.fromEntity(guild);
    }

    @Transactional
    public void deleteGuild(String guildId, UserEntity user) {
        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        if (!guild.getOwner().getId().equals(user.getId())) {
            throw new com.example.backend.common.exception.UnauthorizedException("Only the owner can delete this guild");
        }

        // Delete channel messages and channels
        for (var channel : channelRepository.findByGuildId(guildId)) {
            channelMessageRepository.deleteAllByChannelId(channel.getId());
        }
        channelRepository.deleteAllByGuildId(guildId);

        // Delete expired invites
        inviteRepository.deleteAllByGuildId(guildId);

        // Roles and members cascade via orphanRemoval
        guildRepository.delete(guild);
    }

    @Transactional
    public void leaveGuild(String guildId, UserEntity user) {
        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        if (guild.getOwner().getId().equals(user.getId())) {
            throw new com.example.backend.common.exception.UnauthorizedException("Owner cannot leave the guild. Transfer ownership or delete the guild.");
        }

        GuildMemberEntity membership = guildMemberRepository.findByGuildIdAndUserId(guildId, user.getId())
                .orElseThrow(() -> new NotFoundException("Not a member of this guild"));

        guildMemberRepository.delete(membership);
    }

    @Transactional
    public InviteResponse generateInvite(String guildId, UserEntity user) {
        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        guildMemberRepository.findByGuildIdAndUserId(guildId, user.getId())
                .orElseThrow(() -> new NotFoundException("Not a member of this guild"));

        String code = generateInviteCode();

        InviteEntity invite = new InviteEntity();
        invite.setId(UUID.randomUUID().toString());
        invite.setCode(code);
        invite.setGuild(guild);
        invite.setCreatedBy(user);
        invite.setCreatedAt(Instant.now());
        invite.setExpiresAt(Instant.now().plusSeconds(86400)); // 24 hours

        invite = inviteRepository.save(invite);

        return new InviteResponse(invite.getCode(), invite.getExpiresAt());
    }

    @Transactional
    public GuildResponse joinGuild(String inviteCode, UserEntity user) {
        InviteEntity invite = inviteRepository.findByCode(inviteCode)
                .orElseThrow(() -> new NotFoundException("Invalid invite code"));

        if (invite.getExpiresAt().isBefore(Instant.now())) {
            inviteRepository.delete(invite);
            throw new NotFoundException("Invite code has expired");
        }

        // Check if already a member
        boolean alreadyMember = guildMemberRepository.findByGuildIdAndUserId(
                invite.getGuild().getId(), user.getId()).isPresent();
        if (alreadyMember) {
            throw new ConflictException("Already a member of this guild");
        }

        GuildMemberEntity member = new GuildMemberEntity();
        member.setId(UUID.randomUUID().toString());
        member.setGuild(invite.getGuild());
        member.setUser(user);
        member.setJoinedAt(Instant.now());
        guildMemberRepository.save(member);

        return GuildResponse.fromEntity(invite.getGuild());
    }

    @Transactional(readOnly = true)
    public List<GuildMemberResponse> listMembers(String guildId, UserEntity user) {
        guildMemberRepository.findByGuildIdAndUserId(guildId, user.getId())
                .orElseThrow(() -> new NotFoundException("Guild not found or not a member"));

        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        return guildMemberRepository.findByGuildId(guildId).stream()
                .map(member -> GuildMemberResponse.fromEntity(member, guild))
                .toList();
    }

    @Transactional
    public void kickMember(String guildId, String targetUserId, UserEntity currentUser) {
        GuildEntity guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new NotFoundException("Guild not found"));

        if (!guild.getOwner().getId().equals(currentUser.getId())) {
            throw new com.example.backend.common.exception.UnauthorizedException("Only the owner can kick members");
        }

        GuildMemberEntity target = guildMemberRepository.findByGuildIdAndUserId(guildId, targetUserId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this guild"));

        guildMemberRepository.delete(target);
    }

    private String generateInviteCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            code.append(INVITE_CHARS.charAt(random.nextInt(INVITE_CHARS.length())));
        }
        return code.toString();
    }
}