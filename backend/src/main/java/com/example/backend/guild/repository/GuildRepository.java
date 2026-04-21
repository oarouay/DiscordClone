package com.example.backend.guild.repository;

import com.example.backend.guild.model.GuildEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuildRepository extends JpaRepository<GuildEntity, Long> {
    List<GuildEntity> findByOwnerId(String ownerId);
}
