package com.example.backend.channel.repository;

import com.example.backend.channel.model.ChannelEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelRepository extends JpaRepository<ChannelEntity, String> {
    
    @EntityGraph(attributePaths = {"guild"})
    List<ChannelEntity> findByGuildIdOrderByCreatedAtAsc(String guildId);
}
