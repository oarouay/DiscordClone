package com.example.backend.friend.model;

import com.example.backend.user.model.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "friendships")
public class FriendshipEntity {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_one_id", nullable = false)
    private UserEntity userOne;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_two_id", nullable = false)
    private UserEntity userTwo;

    @Column(nullable = false)
    private String pairKey;

    @Column(nullable = false)
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UserEntity getUserOne() {
        return userOne;
    }

    public void setUserOne(UserEntity userOne) {
        this.userOne = userOne;
    }

    public UserEntity getUserTwo() {
        return userTwo;
    }

    public void setUserTwo(UserEntity userTwo) {
        this.userTwo = userTwo;
    }

    public String getPairKey() {
        return pairKey;
    }

    public void setPairKey(String pairKey) {
        this.pairKey = pairKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
