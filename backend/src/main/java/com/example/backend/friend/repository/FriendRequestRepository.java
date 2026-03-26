package com.example.backend.friend.repository;

import com.example.backend.friend.model.FriendRequestEntity;
import com.example.backend.friend.model.FriendRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRequestRepository extends JpaRepository<FriendRequestEntity, String> {

    List<FriendRequestEntity> findAllByReceiverIdAndStatusOrderByCreatedAtDesc(String receiverId, FriendRequestStatus status);

    List<FriendRequestEntity> findAllByRequesterIdAndStatusOrderByCreatedAtDesc(String requesterId, FriendRequestStatus status);

    Optional<FriendRequestEntity> findFirstByRequesterIdAndReceiverIdAndStatus(String requesterId, String receiverId, FriendRequestStatus status);

    Optional<FriendRequestEntity> findByIdAndReceiverId(String id, String receiverId);
}
