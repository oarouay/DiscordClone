package com.example.backend.channel.repository;

import com.example.backend.channel.model.ChannelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelRepository extends JpaRepository<ChannelEntity, String> {

    List<ChannelEntity> findByGuildId(String guildId);

    List<ChannelEntity> findByGuildIdOrderByCreatedAtAsc(String guildId);

    List<ChannelEntity> findByGuildIdOrderByPositionAsc(String guildId);

    long countByGuildId(String guildId);

    void deleteAllByGuildId(String guildId);
}