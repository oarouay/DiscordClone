package com.example.backend.friend.service;

import com.example.backend.common.exception.ConflictException;
import com.example.backend.common.exception.NotFoundException;
import com.example.backend.friend.dto.FriendRequestResponse;
import com.example.backend.friend.dto.FriendResponse;
import com.example.backend.friend.model.FriendRequestEntity;
import com.example.backend.friend.model.FriendRequestStatus;
import com.example.backend.friend.model.FriendshipEntity;
import com.example.backend.friend.repository.FriendRequestRepository;
import com.example.backend.friend.repository.FriendshipRepository;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.model.UserEntity;
import com.example.backend.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FriendService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;

    public FriendService(
            UserRepository userRepository,
            FriendRequestRepository friendRequestRepository,
            FriendshipRepository friendshipRepository
    ) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.friendshipRepository = friendshipRepository;
    }

    @Transactional
    public FriendRequestResponse sendRequest(UserEntity requester, String targetUserId) {
        if (requester.getId().equals(targetUserId)) {
            throw new ConflictException("You cannot send a friend request to yourself");
        }

        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("Target user not found"));

        String pairKey = buildPairKey(requester.getId(), target.getId());
        if (friendshipRepository.findByPairKey(pairKey).isPresent()) {
            throw new ConflictException("Users are already friends");
        }

        if (friendRequestRepository.findFirstByRequesterIdAndReceiverIdAndStatus(
                requester.getId(),
                target.getId(),
                FriendRequestStatus.PENDING
        ).isPresent()) {
            throw new ConflictException("Friend request already sent");
        }

        var reversePending = friendRequestRepository.findFirstByRequesterIdAndReceiverIdAndStatus(
                target.getId(),
                requester.getId(),
                FriendRequestStatus.PENDING
        );
        if (reversePending.isPresent()) {
            throw new ConflictException("This user already sent you a request. Accept it instead");
        }

        FriendRequestEntity request = new FriendRequestEntity();
        request.setId(generateRequestId());
        request.setRequester(requester);
        request.setReceiver(target);
        request.setStatus(FriendRequestStatus.PENDING);
        request.setCreatedAt(Instant.now());
        request.setRespondedAt(null);

        FriendRequestEntity saved = friendRequestRepository.save(request);
        return FriendRequestResponse.fromEntity(saved);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "friends", key = "#receiver.id")
    @Transactional
    public FriendRequestResponse acceptRequest(UserEntity receiver, String requestId) {
        FriendRequestEntity request = friendRequestRepository.findByIdAndReceiverId(requestId, receiver.getId())
                .orElseThrow(() -> new NotFoundException("Friend request not found"));

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new ConflictException("Friend request is no longer pending");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        request.setRespondedAt(Instant.now());
        FriendRequestEntity savedRequest = friendRequestRepository.save(request);

        String pairKey = buildPairKey(request.getRequester().getId(), request.getReceiver().getId());
        if (friendshipRepository.findByPairKey(pairKey).isEmpty()) {
            FriendshipEntity friendship = new FriendshipEntity();
            friendship.setId(generateFriendshipId());
            friendship.setUserOne(resolveFirstUser(request.getRequester(), request.getReceiver()));
            friendship.setUserTwo(resolveSecondUser(request.getRequester(), request.getReceiver()));
            friendship.setPairKey(pairKey);
            friendship.setCreatedAt(Instant.now());
            friendshipRepository.save(friendship);
        }

        return FriendRequestResponse.fromEntity(savedRequest);
    }

    @Transactional
    public FriendRequestResponse declineRequest(UserEntity receiver, String requestId) {
        FriendRequestEntity request = friendRequestRepository.findByIdAndReceiverId(requestId, receiver.getId())
                .orElseThrow(() -> new NotFoundException("Friend request not found"));

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new ConflictException("Friend request is no longer pending");
        }

        request.setStatus(FriendRequestStatus.DECLINED);
        request.setRespondedAt(Instant.now());
        FriendRequestEntity saved = friendRequestRepository.save(request);
        return FriendRequestResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getIncomingRequests(UserEntity user) {
        return friendRequestRepository.findAllByReceiverIdAndStatusOrderByCreatedAtDesc(
                        user.getId(),
                        FriendRequestStatus.PENDING
                )
                .stream()
                .map(FriendRequestResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getOutgoingRequests(UserEntity user) {
        return friendRequestRepository.findAllByRequesterIdAndStatusOrderByCreatedAtDesc(
                        user.getId(),
                        FriendRequestStatus.PENDING
                )
                .stream()
                .map(FriendRequestResponse::fromEntity)
                .toList();
    }

    @org.springframework.cache.annotation.Cacheable(value = "friends", key = "#user.id")
    @Transactional(readOnly = true)
    public List<FriendResponse> getFriends(UserEntity user) {
        return friendshipRepository.findAllByUserOneIdOrUserTwoIdOrderByCreatedAtDesc(user.getId(), user.getId())
                .stream()
                .map(friendship -> {
                    UserEntity friend = friendship.getUserOne().getId().equals(user.getId())
                            ? friendship.getUserTwo()
                            : friendship.getUserOne();
                    return new FriendResponse(UserResponse.fromEntity(friend), friendship.getCreatedAt());
                })
                .toList();
    }

    @org.springframework.cache.annotation.CacheEvict(value = "friends", key = "#user.id")
    @Transactional
    public void removeFriend(UserEntity user, String friendUserId) {
        UserEntity friend = userRepository.findById(friendUserId)
                .orElseThrow(() -> new NotFoundException("Friend user not found"));

        String pairKey = buildPairKey(user.getId(), friend.getId());
        FriendshipEntity friendship = friendshipRepository.findByPairKey(pairKey)
                .orElseThrow(() -> new NotFoundException("Friendship not found"));

        friendshipRepository.delete(friendship);
    }

    public String buildPairKey(String userAId, String userBId) {
        return userAId.compareTo(userBId) < 0 ? userAId + ":" + userBId : userBId + ":" + userAId;
    }

    @Transactional(readOnly = true)
    public boolean areFriends(String userIdA, String userIdB) {
        String pairKey = buildPairKey(userIdA, userIdB);
        return friendshipRepository.findByPairKey(pairKey).isPresent();
    }

    private UserEntity resolveFirstUser(UserEntity userA, UserEntity userB) {
        return userA.getId().compareTo(userB.getId()) < 0 ? userA : userB;
    }

    private UserEntity resolveSecondUser(UserEntity userA, UserEntity userB) {
        return userA.getId().compareTo(userB.getId()) < 0 ? userB : userA;
    }

    private String generateRequestId() {
        return "fr_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private String generateFriendshipId() {
        return "fs_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
