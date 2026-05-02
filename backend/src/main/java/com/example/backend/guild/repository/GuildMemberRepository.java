package com.example.backend.guild.repository;

import com.example.backend.guild.model.GuildMemberEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuildMemberRepository extends JpaRepository<GuildMemberEntity, String> {
    
    @EntityGraph(attributePaths = {"user", "guild", "roles"})
    List<GuildMemberEntity> findByGuildId(String guildId);
    
    @EntityGraph(attributePaths = {"user", "guild", "roles"})
    List<GuildMemberEntity> findByUserId(String userId);
    
    @EntityGraph(attributePaths = {"user", "guild", "roles"})
    Optional<GuildMemberEntity> findByGuildIdAndUserId(String guildId, String userId);
}
