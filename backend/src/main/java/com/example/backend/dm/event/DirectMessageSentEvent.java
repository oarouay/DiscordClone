package com.example.backend.dm.event;

import com.example.backend.dm.dto.DirectMessageResponse;
import org.springframework.context.ApplicationEvent;

public class DirectMessageSentEvent extends ApplicationEvent {
    private final DirectMessageResponse message;
    private final String senderId;
    private final String recipientId;

    public DirectMessageSentEvent(Object source, DirectMessageResponse message, String senderId, String recipientId) {
        super(source);
        this.message = message;
        this.senderId = senderId;
        this.recipientId = recipientId;
    }

    public DirectMessageResponse getMessage() {
        return message;
    }

    public String getSenderId() {
        return senderId;
    }

    public String getRecipientId() {
        return recipientId;
    }
}