package com.example.backend.guild.model;

import jakarta.persistence.*;

@Entity
@Table(name = "guild_roles")
public class RoleEntity {

    @Id
    private Long id; // Snowflake

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guild_id", nullable = false)
    private GuildEntity guild;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color; // eg "#FF0000"

    @Column(nullable = false)
    private Long permissionsBitmask;

    @Column(nullable = false)
    private Integer position; // Lower number means logically higher position hierarchy

    @Column(nullable = false)
    private Boolean isHoist; // Should this role be displayed separately in the UI sidebar?

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public GuildEntity getGuild() { return guild; }
    public void setGuild(GuildEntity guild) { this.guild = guild; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Long getPermissionsBitmask() { return permissionsBitmask; }
    public void setPermissionsBitmask(Long permissionsBitmask) { this.permissionsBitmask = permissionsBitmask; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Boolean getHoist() { return isHoist; }
    public void setHoist(Boolean hoist) { isHoist = hoist; }
}
