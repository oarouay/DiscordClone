package com.example.backend.channel.model;

import com.example.backend.user.model.UserEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "channel_messages")
public class ChannelMessageEntity {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private ChannelEntity channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserEntity sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant editedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public ChannelEntity getChannel() { return channel; }
    public void setChannel(ChannelEntity channel) { this.channel = channel; }

    public UserEntity getSender() { return sender; }
    public void setSender(UserEntity sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getEditedAt() { return editedAt; }
    public void setEditedAt(Instant editedAt) { this.editedAt = editedAt; }
}
