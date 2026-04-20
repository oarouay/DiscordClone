package com.example.backend.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisMessageSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public RedisMessageSubscriber(ObjectMapper objectMapper, SimpMessagingTemplate simpMessagingTemplate) {
        this.objectMapper = objectMapper;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String jsonPayload = new String(message.getBody());
            RedisMessagePayload payload = objectMapper.readValue(jsonPayload, RedisMessagePayload.class);
            
            // Deliver the broadcasted payload strictly to the local Spring instance's WebSockets.
            // If the user happens to be connected to this specific server node, they get it instantly!
            simpMessagingTemplate.convertAndSendToUser(
                    payload.targetUserId(),
                    "/queue/messages", 
                    payload.message()
            );

        } catch (Exception e) {
            System.err.println("Failed to parse incoming Redis PubSub Chat event: " + e.getMessage());
        }
    }
}
