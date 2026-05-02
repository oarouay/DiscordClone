package com.example.backend.channel.model;

import com.example.backend.guild.model.GuildEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "channels")
public class ChannelEntity {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guild_id", nullable = false)
    private GuildEntity guild;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChannelType type;

    @Column(nullable = false)
    private Instant createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public GuildEntity getGuild() { return guild; }
    public void setGuild(GuildEntity guild) { this.guild = guild; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ChannelType getType() { return type; }
    public void setType(ChannelType type) { this.type = type; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
