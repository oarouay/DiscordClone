package com.example.backend.dm.controller;

import com.example.backend.auth.security.AuthenticatedUserService;
import com.example.backend.dm.dto.DirectMessageConversationResponse;
import com.example.backend.dm.dto.DirectMessageResponse;
import com.example.backend.dm.dto.SendDirectMessageRequest;
import com.example.backend.dm.service.DirectMessageService;
import com.example.backend.user.model.UserEntity;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dms")
public class DirectMessageController {

    private final AuthenticatedUserService authenticatedUserService;
    private final DirectMessageService directMessageService;

    public DirectMessageController(
            AuthenticatedUserService authenticatedUserService,
            DirectMessageService directMessageService
    ) {
        this.authenticatedUserService = authenticatedUserService;
        this.directMessageService = directMessageService;
    }

    @GetMapping("/conversations")
    public List<DirectMessageConversationResponse> listConversations(Authentication authentication) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return directMessageService.listConversations(currentUser);
    }

    @GetMapping("/{userId}/messages")
    public List<DirectMessageResponse> getMessages(
            Authentication authentication, 
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return directMessageService.getMessages(currentUser, userId, page, size);
    }

    @PostMapping("/{userId}/messages")
    public DirectMessageResponse sendMessage(
            Authentication authentication,
            @PathVariable String userId,
            @Valid @RequestBody SendDirectMessageRequest request
    ) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return directMessageService.sendMessage(currentUser, userId, request.content());
    }
}
