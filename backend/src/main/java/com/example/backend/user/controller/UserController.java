package com.example.backend.user.controller;

import com.example.backend.auth.security.AuthenticatedUserService;
import com.example.backend.user.dto.UserResponse;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.user.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthenticatedUserService authenticatedUserService;
    private final UserRepository userRepository;

    public UserController(AuthenticatedUserService authenticatedUserService, UserRepository userRepository) {
        this.authenticatedUserService = authenticatedUserService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.fromEntity(authenticatedUserService.getCurrentUser(authentication));
    }

    @GetMapping("/search")
    public List<UserResponse> searchUsers(
            Authentication authentication,
            @RequestParam String query
    ) {
        var currentUser = authenticatedUserService.getCurrentUser(authentication);
        String normalizedQuery = query.trim();
        if (normalizedQuery.isBlank()) {
            return List.of();
        }

        return userRepository.searchUsers(normalizedQuery, currentUser.getId())
                .stream()
                .limit(20)
                .map(UserResponse::fromEntity)
                .toList();
    }
}

