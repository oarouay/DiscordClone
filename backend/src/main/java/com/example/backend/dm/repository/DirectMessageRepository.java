package com.example.backend.dm.repository;

import com.example.backend.dm.model.DirectMessageEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DirectMessageRepository extends JpaRepository<DirectMessageEntity, String> {

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query("""
            select m from DirectMessageEntity m
            where (m.sender.id = :userA and m.recipient.id = :userB)
               or (m.sender.id = :userB and m.recipient.id = :userA)
            order by m.createdAt desc
            """)
    List<DirectMessageEntity> findConversation(@Param("userA") String userA, @Param("userB") String userB, Pageable pageable);

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query("""
            select m from DirectMessageEntity m
            where (
                (m.sender.id = :userA and m.recipient.id = :userB)
                or (m.sender.id = :userB and m.recipient.id = :userA)
            )
            order by m.createdAt desc
            limit 1
            """)
    Optional<DirectMessageEntity> findLatestBetween(@Param("userA") String userA, @Param("userB") String userB);

    @Query(value = """
            select distinct on (
                case when sender_id < recipient_id then sender_id else recipient_id end,
                case when sender_id < recipient_id then recipient_id else sender_id end
            ) *
            from direct_messages
            where sender_id = :userId or recipient_id = :userId
            order by 
                case when sender_id < recipient_id then sender_id else recipient_id end,
                case when sender_id < recipient_id then recipient_id else sender_id end,
                created_at desc
            """, nativeQuery = true)
    List<DirectMessageEntity> findLatestMessagesForUser(@Param("userId") String userId);
}
