package com.example.backend.realtime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.example.backend.dm.dto.DirectMessageResponse;
import com.example.backend.dm.event.DirectMessageSentEvent;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.model.UserStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DirectMessageBroadcastListenerTest {

    @Mock
    private WebSocketSessionRegistry sessionRegistry;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private DirectMessageBroadcastListener listener;

    @BeforeEach
    void setUp() {
        listener = new DirectMessageBroadcastListener(sessionRegistry, objectMapper);
    }

    @Test
    void messageFanoutUsesViewerSpecificChannelIds() throws Exception {
        DirectMessageResponse senderResponse = new DirectMessageResponse(
                "dm_msg_1",
                "dm_u_recipient",
                new UserResponse("u_sender", "sender", "Sender", "sender@example.com", UserStatus.ONLINE, null),
                "hello",
                null,
                null
        );

        DirectMessageSentEvent event = new DirectMessageSentEvent(this, senderResponse, "u_sender", "u_recipient");

        listener.handleDirectMessageSentEvent(event);

        ArgumentCaptor<String> userCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);
        verify(sessionRegistry, times(2)).sendToUser(userCaptor.capture(), payloadCaptor.capture());

        Map<String, String> payloadByUser = new HashMap<>();
        for (int i = 0; i < userCaptor.getAllValues().size(); i++) {
            payloadByUser.put(userCaptor.getAllValues().get(i), payloadCaptor.getAllValues().get(i));
        }

        JsonNode senderPayload = objectMapper.readTree(payloadByUser.get("u_sender"));
        JsonNode recipientPayload = objectMapper.readTree(payloadByUser.get("u_recipient"));

        assertEquals("message", senderPayload.path("type").asText());
        assertEquals("dm_u_recipient", senderPayload.path("payload").path("channelId").asText());

        assertEquals("message", recipientPayload.path("type").asText());
        assertEquals("dm_u_sender", recipientPayload.path("payload").path("channelId").asText());
        assertEquals("hello", recipientPayload.path("payload").path("content").asText());
    }
}