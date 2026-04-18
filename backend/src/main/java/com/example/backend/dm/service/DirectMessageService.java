package com.example.backend.dm.service;

import com.example.backend.common.exception.ConflictException;
import com.example.backend.common.exception.NotFoundException;
import com.example.backend.dm.dto.DirectMessageConversationResponse;
import com.example.backend.dm.dto.DirectMessageResponse;
import com.example.backend.dm.model.DirectMessageEntity;
import com.example.backend.dm.repository.DirectMessageRepository;
import com.example.backend.friend.dto.FriendResponse;
import com.example.backend.friend.repository.FriendshipRepository;
import com.example.backend.friend.service.FriendService;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DirectMessageService {

    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;
    private final FriendService friendService;
    private final FriendshipRepository friendshipRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate simpMessagingTemplate;

    public DirectMessageService(
            DirectMessageRepository directMessageRepository,
            UserRepository userRepository,
            FriendService friendService,
            FriendshipRepository friendshipRepository,
            org.springframework.messaging.simp.SimpMessagingTemplate simpMessagingTemplate
    ) {
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
        this.friendService = friendService;
        this.friendshipRepository = friendshipRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<DirectMessageConversationResponse> listConversations(UserEntity currentUser) {
        return friendService.getFriends(currentUser)
                .stream()
                .map(friend -> toConversationResponse(currentUser, friend))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DirectMessageResponse> getMessages(UserEntity currentUser, String otherUserId, int page, int size) {
        UserEntity otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new NotFoundException("DM user not found"));
        ensureFriendship(currentUser.getId(), otherUser.getId());

        List<DirectMessageResponse> messages = new java.util.ArrayList<>(
            directMessageRepository.findConversation(currentUser.getId(), otherUser.getId(), org.springframework.data.domain.PageRequest.of(page, size))
                .stream()
                .map(message -> DirectMessageResponse.fromEntity(
                    message,
                    currentUser,
                    message.getContent()
                ))
                .toList()
        );
        java.util.Collections.reverse(messages);
        return messages;
    }

    @Transactional
    public DirectMessageResponse sendMessage(UserEntity currentUser, String recipientId, String content) {
        UserEntity recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new NotFoundException("DM recipient not found"));

        if (recipient.getId().equals(currentUser.getId())) {
            throw new ConflictException("You cannot send a DM to yourself");
        }

        ensureFriendship(currentUser.getId(), recipient.getId());

        DirectMessageEntity message = new DirectMessageEntity();
        message.setId(generateMessageId());
        message.setSender(currentUser);
        message.setRecipient(recipient);
        message.setContent(content.trim());
        message.setCreatedAt(Instant.now());
        message.setEditedAt(null);

        DirectMessageEntity saved = directMessageRepository.save(message);
        DirectMessageResponse response = DirectMessageResponse.fromEntity(saved, currentUser, content.trim());
        
        simpMessagingTemplate.convertAndSendToUser(recipient.getId(), "/queue/messages", response);
        simpMessagingTemplate.convertAndSendToUser(currentUser.getId(), "/queue/messages", response);
        
        return response;
    }

    @Transactional
    public DirectMessageResponse sendMessage(String senderId, String recipientId, String content) {
        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new NotFoundException("DM sender not found"));
        return sendMessage(sender, recipientId, content);
    }

    private void ensureFriendship(String userAId, String userBId) {
        String pairKey = friendService.buildPairKey(userAId, userBId);
        if (friendshipRepository.findByPairKey(pairKey).isEmpty()) {
            throw new ConflictException("Users are not friends");
        }
    }

    private DirectMessageConversationResponse toConversationResponse(UserEntity currentUser, FriendResponse friend) {
        String otherUserId = friend.user().id();
        var latestMessage = directMessageRepository.findLatestBetween(currentUser.getId(), otherUserId);

        return new DirectMessageConversationResponse(
                "dm_" + otherUserId,
                friend.user(),
                latestMessage.map(DirectMessageEntity::getContent).orElse(null),
                latestMessage.map(DirectMessageEntity::getCreatedAt).orElse(null)
        );
    }

    private String generateMessageId() {
        return "dm_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
