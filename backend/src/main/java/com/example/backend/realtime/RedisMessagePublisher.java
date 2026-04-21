package com.example.backend.realtime;

import com.example.backend.dm.dto.DirectMessageResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisMessagePublisher {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisMessagePublisher(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishMessage(String targetUserId, DirectMessageResponse message) {
        try {
            RedisMessagePayload payload = new RedisMessagePayload(targetUserId, message);
            String jsonFormat = objectMapper.writeValueAsString(payload);
            redisTemplate.convertAndSend(RedisPubSubConfig.CHAT_TOPIC, jsonFormat);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize Redis message", e);
        }
    }
}
