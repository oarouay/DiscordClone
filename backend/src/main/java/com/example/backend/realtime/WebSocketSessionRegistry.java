package com.example.backend.realtime;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Component
public class WebSocketSessionRegistry {

    private final ConcurrentHashMap<String, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

    public void register(String userId, WebSocketSession session) {
        sessionsByUserId.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
        System.out.println("Registered WebSocket session for user: " + userId + ", total sessions for user: " + sessionsByUserId.get(userId).size());
    }

    public void unregister(String userId, WebSocketSession session) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null) {
            return;
        }

        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserId.remove(userId);
        }
    }

    public void sendToUser(String userId, String payload) {
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        System.out.println("WebSocket fanout to user : " + userId + " -> " + (sessions != null ? sessions.size() : 0) + " sessions");
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        TextMessage textMessage = new TextMessage(payload);
        sessions.removeIf(session -> !session.isOpen());
        for (WebSocketSession session : sessions) {
            try {
                synchronized(session) {
                    session.sendMessage(textMessage);
                }
            } catch (Exception ignored) {
                try {
                    session.close();
                } catch (Exception closeIgnored) {
                    // Ignore close exceptions in best-effort fanout.
                }
            }
        }
    }
}
