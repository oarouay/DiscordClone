package com.example.backend.call;

public class SignalingMessageDTO {

    public enum Type {
        CALL_INITIATE,
        CALL_ACCEPT,
        CALL_DECLINE,
        CALL_HANGUP,
        CALL_TIMEOUT,
        WEBRTC_OFFER,
        WEBRTC_ANSWER,
        WEBRTC_ICE_CANDIDATE
    }

    private Type type;
    private String senderId;
    private String recipientId;
    private String payload;

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}
