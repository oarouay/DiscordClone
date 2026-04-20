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
    private final com.example.backend.realtime.RedisMessagePublisher redisMessagePublisher;

    public DirectMessageService(
            DirectMessageRepository directMessageRepository,
            UserRepository userRepository,
            FriendService friendService,
            FriendshipRepository friendshipRepository,
            com.example.backend.realtime.RedisMessagePublisher redisMessagePublisher
    ) {
        this.directMessageRepository = directMessageRepository;
        this.userRepository = userRepository;
        this.friendService = friendService;
        this.friendshipRepository = friendshipRepository;
        this.redisMessagePublisher = redisMessagePublisher;
    }

    @Transactional(readOnly = true)
    public List<DirectMessageConversationResponse> listConversations(UserEntity currentUser) {
        List<FriendResponse> friends = friendService.getFriends(currentUser);
        
        java.util.Map<String, DirectMessageEntity> latestMessagesByFriend = directMessageRepository
                .findLatestMessagesForUser(currentUser.getId())
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        msg -> msg.getSender().getId().equals(currentUser.getId()) 
                                ? msg.getRecipient().getId() 
                                : msg.getSender().getId(),
                        msg -> msg,
                        (existing, replacement) -> existing
                ));

        return friends.stream()
                .map(friend -> {
                    String otherUserId = friend.user().id();
                    DirectMessageEntity latestMessage = latestMessagesByFriend.get(otherUserId);
                    return new DirectMessageConversationResponse(
                            "dm_" + otherUserId,
                            friend.user(),
                            latestMessage != null ? latestMessage.getContent() : null,
                            latestMessage != null ? latestMessage.getCreatedAt() : null
                    );
                })
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
        
        DirectMessageResponse senderResponse = DirectMessageResponse.fromEntity(saved, currentUser, content.trim());
        DirectMessageResponse recipientResponse = DirectMessageResponse.fromEntity(saved, recipient, content.trim());
        
        redisMessagePublisher.publishMessage(currentUser.getId(), senderResponse);
        redisMessagePublisher.publishMessage(recipient.getId(), recipientResponse);
        
        return senderResponse;
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



    private String generateMessageId() {
        return "dm_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
