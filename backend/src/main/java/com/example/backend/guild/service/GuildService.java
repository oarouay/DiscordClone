package com.example.backend.guild.service;

import com.example.backend.common.util.SnowflakeIdGenerator;
import com.example.backend.guild.model.*;
import com.example.backend.guild.repository.GuildMemberRepository;
import com.example.backend.guild.repository.GuildRepository;
import com.example.backend.guild.repository.RoleRepository;
import com.example.backend.user.model.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Service
public class GuildService {

    private final GuildRepository guildRepository;
    private final RoleRepository roleRepository;
    private final GuildMemberRepository guildMemberRepository;

    public GuildService(GuildRepository guildRepository, RoleRepository roleRepository, GuildMemberRepository guildMemberRepository) {
        this.guildRepository = guildRepository;
        this.roleRepository = roleRepository;
        this.guildMemberRepository = guildMemberRepository;
    }

    @Transactional
    public GuildEntity createGuild(UserEntity owner, String name, String iconUrl) {
        // 1. Create the Guild Base
        GuildEntity guild = new GuildEntity();
        guild.setId(SnowflakeIdGenerator.generate());
        guild.setOwner(owner);
        guild.setName(name);
        guild.setIconUrl(iconUrl);
        guild.setCreatedAt(Instant.now());
        guild = guildRepository.save(guild);

        // 2. Generate the immutable @everyone Role (Permissions: Send Messages, Read History, etc)
        long everyonePermissions = GuildPermission.SEND_MESSAGES.getValue() 
                                 | GuildPermission.VIEW_CHANNEL.getValue()
                                 | GuildPermission.READ_MESSAGE_HISTORY.getValue()
                                 | GuildPermission.CONNECT.getValue()
                                 | GuildPermission.SPEAK.getValue();

        RoleEntity everyoneRole = new RoleEntity();
        everyoneRole.setId(SnowflakeIdGenerator.generate());
        everyoneRole.setGuild(guild);
        everyoneRole.setName("@everyone");
        everyoneRole.setColor("#99AAB5");
        everyoneRole.setPermissionsBitmask(everyonePermissions);
        everyoneRole.setPosition(0);
        everyoneRole.setHoist(false);
        everyoneRole = roleRepository.save(everyoneRole);

        // 3. Generate the exclusive "Owner" Role
        RoleEntity ownerRole = new RoleEntity();
        ownerRole.setId(SnowflakeIdGenerator.generate());
        ownerRole.setGuild(guild);
        ownerRole.setName("Owner");
        ownerRole.setColor("#FFD700");
        ownerRole.setPermissionsBitmask(GuildPermission.ADMINISTRATOR.getValue());
        ownerRole.setPosition(100); // Top of hierarchy
        ownerRole.setHoist(true);
        ownerRole = roleRepository.save(ownerRole);

        // 4. Bind the Owner as a standard Member but inject both Roles!
        GuildMemberEntity ownerMember = new GuildMemberEntity();
        ownerMember.setId(SnowflakeIdGenerator.generate());
        ownerMember.setGuild(guild);
        ownerMember.setUser(owner);
        ownerMember.setJoinedAt(Instant.now());
        
        Set<RoleEntity> roles = new HashSet<>();
        roles.add(everyoneRole);
        roles.add(ownerRole);
        ownerMember.setRoles(roles);

        guildMemberRepository.save(ownerMember);

        return guild;
    }
}
