package com.example.backend.auth.security;

import com.example.backend.common.exception.UnauthorizedException;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new UnauthorizedException("Unauthorized");
        }

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }
}
