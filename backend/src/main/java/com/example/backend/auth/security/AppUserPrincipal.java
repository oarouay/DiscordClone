package com.example.backend.auth.security;

import com.example.backend.user.model.UserEntity;
import com.example.backend.user.model.UserStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class AppUserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String passwordHash;
    private final String username;
    private final String displayName;
    private final UserStatus status;
    private final String avatarUrl;

    public AppUserPrincipal(UserEntity user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.username = user.getUsername();
        this.displayName = user.getDisplayName();
        this.status = user.getStatus();
        this.avatarUrl = user.getAvatarUrl();
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getAppUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

