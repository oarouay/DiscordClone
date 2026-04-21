# Backend Architecture Refactoring Specification

This document outlines the architectural changes implemented in the real-time messaging and data persistence layers of the Discord Clone backend, along with the rationale driving these changes.

## 1. Unified Real-Time Architecture (Migration to STOMP)

### What Changed
- **Removed Raw WebSockets:** Deleted the custom raw WebSocket implementation (`DmWebSocketHandler.java`, `WebSocketConfig.java`, and `WebSocketSessionRegistry.java`).
- **Adopted STOMP Messaging:** Migrated direct message (DM) delivery to leverage the pre-existing STOMP message broker (`@EnableWebSocketMessageBroker`).
- **Created Message Controller:** Introduced `DirectMessageWebSocketController.java` mapped to `/chat.message` for handling incoming socket messages securely.
- **Frontend Refactor:** Adapted the Next.js `useWebSocket.ts` hook to wrap the existing STOMP client (`useStompContext`) rather than maintaining a custom HTTP/WS pipeline.

### Why It Was Changed
Previously, the backend managed two completely separate WebSocket servers: one handling raw JSON WebSockets for text chat, and another using STOMP-over-WebSockets for Voice/Video WebRTC signaling.
- **Connection Overhead:** Clients were opening two heavy WebSocket connections per session.
- **Code Duplication:** Authentication token extraction and session registries were manually duplicated across both systems.
- **Scalability:** Manual JSON routing via switch-case statements (`switch(type) { case 'auth': ... }`) is rigid. STOMP provides industry-standard pub-sub routing natively, allowing us to drop hacky application events (`DirectMessageBroadcastListener`) in favor of `SimpMessagingTemplate.convertAndSendToUser`.

---

## 2. At-Rest Encryption Decoupling (JPA AttributeConverter)

### What Changed
- **Extracted Cryptography Logic:** Removed direct calls to `messageCryptoService.encrypt()` and `decrypt()` from the business logic layer (`DirectMessageService.java`).
- **Implemented JPA Converter:** Created `EncryptedStringConverter.java` which implements JPA's `AttributeConverter<String, String>` and applied it via `@Convert(converter = EncryptedStringConverter.class)` onto the `content` field of the `DirectMessageEntity`.

### Why It Was Changed
Mixing database encryption logic with business logic violates the Single Responsibility Principle. 
By moving the AES-CBC encryption routine to the persistence layer (JPA Converter), we achieved transparent encryption. The Java application (Controllers and Services) now only interacts with standard unencrypted text, while Hibernate automatically encrypts the data just before database insertion and decrypts it immediately upon retrieval. This prevents developers from accidentally saving plaintext messages in the future.

---

## 3. Message History Pagination

### What Changed
- **Repository Optimization:** Upgraded the `DirectMessageRepository` queries to leverage Spring Data's `Pageable` parameters and adjusted sorting to pull the newest records (`ORDER BY createdAt DESC`) efficiently.
- **Service API Update:** `getMessages` now accepts `page` and `size` parameters, truncating the result sets loaded into memory and reversing the slice so the frontend receives chronological arrays.

### Why It Was Changed
Fetching an entire conversation history (`SELECT * FROM messages WHERE ...`) and keeping it persistently in memory via `.stream().toList()` posed a severe memory leak and `OutOfMemoryError` risk as users accumulated thousands of messages. Paginating queries protects the JVM heap and accelerates frontend data delivery. 
