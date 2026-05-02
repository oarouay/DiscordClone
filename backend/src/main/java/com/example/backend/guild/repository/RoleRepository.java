package com.example.backend.guild.repository;

import com.example.backend.guild.model.RoleEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, String> {
    
    @EntityGraph(attributePaths = {"guild"})
    List<RoleEntity> findByGuildIdOrderByPositionDesc(String guildId);
}
