package com.example.backend.auth.service;

import com.example.backend.auth.dto.AuthResponse;
import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.RegisterRequest;
import com.example.backend.auth.security.AppUserPrincipal;
import com.example.backend.auth.security.JwtService;
import com.example.backend.common.exception.ConflictException;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.model.UserStatus;
import com.example.backend.user.repository.UserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        String normalizedUsername = request.username().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already exists");
        }
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new ConflictException("Username already exists");
        }

        UserEntity user = new UserEntity();
        user.setId(generateUserId());
        user.setUsername(normalizedUsername);
        user.setDisplayName(request.displayName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(UserStatus.ONLINE);
        user.setAvatarUrl(null);

        UserEntity savedUser = userRepository.save(user);
        AppUserPrincipal principal = new AppUserPrincipal(savedUser);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(token, UserResponse.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        var authToken = new UsernamePasswordAuthenticationToken(normalizedEmail, request.password());
        var authentication = authenticationManager.authenticate(authToken);

        if (!(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(principal);
        UserEntity user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        return new AuthResponse(token, UserResponse.fromEntity(user));
    }

    private String generateUserId() {
        return "u_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}

