package com.example.backend.realtime;

import com.example.backend.auth.security.AppUserDetailsService;
import com.example.backend.auth.security.AppUserPrincipal;
import com.example.backend.auth.security.JwtService;
import java.security.Principal;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final AppUserDetailsService appUserDetailsService;

    public StompAuthChannelInterceptor(JwtService jwtService, AppUserDetailsService appUserDetailsService) {
        this.jwtService = jwtService;
        this.appUserDetailsService = appUserDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String rawAuthHeader = accessor.getFirstNativeHeader("Authorization");
            String token = extractToken(rawAuthHeader);
            if (token == null || token.isBlank()) {
                throw new AccessDeniedException("Missing Authorization header for STOMP CONNECT");
            }

            String email = jwtService.extractEmail(token);
            AppUserPrincipal principal = (AppUserPrincipal) appUserDetailsService.loadUserByUsername(email);
            if (!jwtService.isTokenValid(token, principal)) {
                throw new AccessDeniedException("Invalid JWT token for STOMP CONNECT");
            }

            accessor.setUser(new StompUserPrincipal(principal.getId()));
        }

        return message;
    }

    private String extractToken(String rawAuthHeader) {
        if (rawAuthHeader == null || rawAuthHeader.isBlank()) {
            return null;
        }

        if (rawAuthHeader.startsWith("Bearer ")) {
            return rawAuthHeader.substring(7);
        }

        return rawAuthHeader;
    }

    private record StompUserPrincipal(String name) implements Principal {
        @Override
        public String getName() {
            return name;
        }
    }
}