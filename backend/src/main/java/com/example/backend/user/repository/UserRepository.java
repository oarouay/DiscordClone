package com.example.backend.user.repository;

import com.example.backend.user.model.UserEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

        @Query("""
                        select u from UserEntity u
                        where u.id <> :excludeUserId
                            and (
                                    lower(u.username) like lower(concat('%', :query, '%'))
                                    or lower(u.displayName) like lower(concat('%', :query, '%'))
                                    or lower(u.email) like lower(concat('%', :query, '%'))
                            )
                        order by u.displayName asc
                        """)
        List<UserEntity> searchUsers(@Param("query") String query, @Param("excludeUserId") String excludeUserId);
}

