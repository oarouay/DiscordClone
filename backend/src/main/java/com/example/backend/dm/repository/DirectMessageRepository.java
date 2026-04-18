package com.example.backend.dm.repository;

import com.example.backend.dm.model.DirectMessageEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DirectMessageRepository extends JpaRepository<DirectMessageEntity, String> {

    @Query("""
            select m from DirectMessageEntity m
            where (m.sender.id = :userA and m.recipient.id = :userB)
               or (m.sender.id = :userB and m.recipient.id = :userA)
            order by m.createdAt desc
            """)
    List<DirectMessageEntity> findConversation(@Param("userA") String userA, @Param("userB") String userB, Pageable pageable);

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
}
