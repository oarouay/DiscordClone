package com.example.backend.realtime;

import com.example.backend.dm.dto.DirectMessageResponse;
import com.example.backend.dm.event.DirectMessageSentEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;

@Component
public class DirectMessageBroadcastListener {

    private final WebSocketSessionRegistry sessionRegistry;
    private final ObjectMapper objectMapper;

    public DirectMessageBroadcastListener(WebSocketSessionRegistry sessionRegistry, ObjectMapper objectMapper) {
        this.sessionRegistry = sessionRegistry;
        this.objectMapper = objectMapper;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleDirectMessageSentEvent(DirectMessageSentEvent event) {
        try {
            DirectMessageResponse senderResponse = event.getMessage();
            String senderId = event.getSenderId();
            String recipientId = event.getRecipientId();

            DirectMessageResponse recipientResponse = new DirectMessageResponse(
                    senderResponse.id(),
                    "dm_" + senderId,
                    senderResponse.author(),
                    senderResponse.content(),
                    senderResponse.createdAt(),
                    senderResponse.editedAt()
            );

            System.out.println("Broadcasting message from " + senderId + " to " + recipientId);

            String senderPayload = objectMapper.writeValueAsString(Map.of("type", "message", "payload", senderResponse));
            String recipientPayload = objectMapper.writeValueAsString(Map.of("type", "message", "payload", recipientResponse));

            sessionRegistry.sendToUser(senderId, senderPayload);
            sessionRegistry.sendToUser(recipientId, recipientPayload);
        } catch (Exception e) {
            System.err.println("Failed to broadcast direct message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}