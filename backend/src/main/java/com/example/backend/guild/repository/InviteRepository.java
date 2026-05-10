package com.example.backend.guild.repository;

import com.example.backend.guild.model.InviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InviteRepository extends JpaRepository<InviteEntity, String> {

    Optional<InviteEntity> findByCode(String code);

    void deleteAllByGuildId(String guildId);
}