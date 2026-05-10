package com.example.backend.channel.repository;

import com.example.backend.channel.model.ChannelMessageEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelMessageRepository extends JpaRepository<ChannelMessageEntity, String> {

    Page<ChannelMessageEntity> findByChannelIdOrderByCreatedAtDesc(String channelId, Pageable pageable);

    void deleteAllByChannelId(String channelId);
}