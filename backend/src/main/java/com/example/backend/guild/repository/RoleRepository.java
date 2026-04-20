package com.example.backend.guild.repository;

import com.example.backend.guild.model.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    List<RoleEntity> findByGuildIdOrderByPositionDesc(Long guildId);
}
