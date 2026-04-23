package com.example.backend.friend.repository;

import com.example.backend.friend.model.FriendshipEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendshipRepository extends JpaRepository<FriendshipEntity, String> {

    @EntityGraph(attributePaths = {"userOne", "userTwo"})
    Optional<FriendshipEntity> findByPairKey(String pairKey);

    @EntityGraph(attributePaths = {"userOne", "userTwo"})
    List<FriendshipEntity> findAllByUserOneIdOrUserTwoIdOrderByCreatedAtDesc(String userOneId, String userTwoId);
}
