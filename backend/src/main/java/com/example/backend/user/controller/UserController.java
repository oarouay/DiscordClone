package com.example.backend.user.controller;

import com.example.backend.auth.security.AppUserPrincipal;
import com.example.backend.common.exception.UnauthorizedException;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new UnauthorizedException("Unauthorized");
        }

        UserEntity user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized"));

        return UserResponse.fromEntity(user);
    }
}

