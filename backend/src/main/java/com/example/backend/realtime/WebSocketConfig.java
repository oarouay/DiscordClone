package com.example.backend.realtime;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final DmWebSocketHandler dmWebSocketHandler;

    public WebSocketConfig(DmWebSocketHandler dmWebSocketHandler) {
        this.dmWebSocketHandler = dmWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(dmWebSocketHandler, "/ws")
                .setAllowedOriginPatterns("*");
    }
}
