package com.example.backend.friend.controller;

import com.example.backend.auth.security.AuthenticatedUserService;
import com.example.backend.friend.dto.CreateFriendRequest;
import com.example.backend.friend.dto.FriendRequestResponse;
import com.example.backend.friend.dto.FriendResponse;
import com.example.backend.friend.service.FriendService;
import com.example.backend.user.model.UserEntity;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final AuthenticatedUserService authenticatedUserService;
    private final FriendService friendService;

    public FriendController(
            AuthenticatedUserService authenticatedUserService,
            FriendService friendService
    ) {
        this.authenticatedUserService = authenticatedUserService;
        this.friendService = friendService;
    }

    @GetMapping
    public List<FriendResponse> listFriends(Authentication authentication) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return friendService.getFriends(currentUser);
    }

    @GetMapping("/requests/incoming")
    public List<FriendRequestResponse> listIncomingRequests(Authentication authentication) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return friendService.getIncomingRequests(currentUser);
    }

    @GetMapping("/requests/outgoing")
    public List<FriendRequestResponse> listOutgoingRequests(Authentication authentication) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return friendService.getOutgoingRequests(currentUser);
    }

    @PostMapping("/requests")
    public FriendRequestResponse sendRequest(
            Authentication authentication,
            @Valid @RequestBody CreateFriendRequest request
    ) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return friendService.sendRequest(currentUser, request.targetUserId().trim());
    }

    @PostMapping("/requests/{requestId}/accept")
    public FriendRequestResponse acceptRequest(Authentication authentication, @PathVariable String requestId) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return friendService.acceptRequest(currentUser, requestId);
    }

    @PostMapping("/requests/{requestId}/decline")
    public FriendRequestResponse declineRequest(Authentication authentication, @PathVariable String requestId) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        return friendService.declineRequest(currentUser, requestId);
    }

    @DeleteMapping("/{friendUserId}")
    public void removeFriend(Authentication authentication, @PathVariable String friendUserId) {
        UserEntity currentUser = authenticatedUserService.getCurrentUser(authentication);
        friendService.removeFriend(currentUser, friendUserId);
    }
}
