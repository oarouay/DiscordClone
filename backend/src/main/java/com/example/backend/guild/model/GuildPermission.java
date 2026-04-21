package com.example.backend.guild.model;

/**
 * Standardized Discord-style Bitwise permission mappings.
 * Each permission correlates to a specific binary shift, allowing 
 * hyper-fast calculations directly inside the backend.
 */
public enum GuildPermission {
    CREATE_INVITE(1L << 0),
    KICK_MEMBERS(1L << 1),
    BAN_MEMBERS(1L << 2),
    ADMINISTRATOR(1L << 3), // Bypasses all other permissions natively
    MANAGE_CHANNELS(1L << 4),
    MANAGE_GUILD(1L << 5),
    ADD_REACTIONS(1L << 6),
    VIEW_AUDIT_LOG(1L << 7),
    VIEW_CHANNEL(1L << 10),
    SEND_MESSAGES(1L << 11),
    MANAGE_MESSAGES(1L << 13),
    EMBED_LINKS(1L << 14),
    ATTACH_FILES(1L << 15),
    READ_MESSAGE_HISTORY(1L << 16),
    CONNECT(1L << 20),
    SPEAK(1L << 21),
    MUTE_MEMBERS(1L << 22),
    DEAFEN_MEMBERS(1L << 23),
    MOVE_MEMBERS(1L << 24),
    MANAGE_ROLES(1L << 28);

    private final long value;

    GuildPermission(long value) {
        this.value = value;
    }

    public long getValue() {
        return value;
    }
}
