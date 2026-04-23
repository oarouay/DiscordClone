package com.example.backend.friend.repository;

import com.example.backend.friend.model.FriendRequestEntity;
import com.example.backend.friend.model.FriendRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRequestRepository extends JpaRepository<FriendRequestEntity, String> {

    @EntityGraph(attributePaths = {"requester", "receiver"})
    List<FriendRequestEntity> findAllByReceiverIdAndStatusOrderByCreatedAtDesc(String receiverId, FriendRequestStatus status);

    @EntityGraph(attributePaths = {"requester", "receiver"})
    List<FriendRequestEntity> findAllByRequesterIdAndStatusOrderByCreatedAtDesc(String requesterId, FriendRequestStatus status);

    @EntityGraph(attributePaths = {"requester", "receiver"})
    Optional<FriendRequestEntity> findFirstByRequesterIdAndReceiverIdAndStatus(String requesterId, String receiverId, FriendRequestStatus status);

    @EntityGraph(attributePaths = {"requester", "receiver"})
    Optional<FriendRequestEntity> findByIdAndReceiverId(String id, String receiverId);
}
