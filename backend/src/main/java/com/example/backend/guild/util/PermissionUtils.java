package com.example.backend.guild.util;

import com.example.backend.guild.model.GuildPermission;
import com.example.backend.guild.model.RoleEntity;

import java.util.Collection;

public class PermissionUtils {

    /**
     * Calculates the cumulative permissions of a user based on all of their overlapping roles.
     * @param roles Collection of Roles the user has in this specific guild.
     * @return The 64-bit integer representing their absolute cumulative permission bounds.
     */
    public static long calculateBasePermissions(Collection<RoleEntity> roles) {
        if (roles == null || roles.isEmpty()) {
            return 0L;
        }

        long permissions = 0L;
        for (RoleEntity role : roles) {
            permissions |= role.getPermissionsBitmask();
        }
        return permissions;
    }

    /**
     * Instantly mathematically verifies if a bitmask contains a specific permission.
     * Bypasses specifically if the ADMINISTRATOR bit is flagged.
     */
    public static boolean hasPermission(long bitmask, GuildPermission permission) {
        if ((bitmask & GuildPermission.ADMINISTRATOR.getValue()) != 0) {
            return true;
        }
        return (bitmask & permission.getValue()) != 0;
    }
}
