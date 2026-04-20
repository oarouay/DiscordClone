package com.example.backend.guild.repository;

import com.example.backend.guild.model.GuildMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuildMemberRepository extends JpaRepository<GuildMemberEntity, Long> {
    List<GuildMemberEntity> findByGuildId(Long guildId);
    List<GuildMemberEntity> findByUserId(String userId);
    Optional<GuildMemberEntity> findByGuildIdAndUserId(Long guildId, String userId);
}
