# Guilds & Channels Backend Documentation

This document outlines the architecture, data models, REST APIs, and WebSocket events implemented to support the core Guilds (Servers) and Channels functionality in the Discord Clone.

## 1. Data Models

We have introduced the following JPA entities in the `com.example.backend.channel.model` and `com.example.backend.guild.model` packages:

*   **`GuildEntity`**: Represents a server. Contains an owner (`UserEntity`), name, icon, and a collection of roles and members.
*   **`ChannelEntity`**: Represents a specific communication channel within a Guild. Contains a `name`, a `type` (`TEXT` or `VOICE`), and references the parent `GuildEntity`.
*   **`ChannelMessageEntity`**: Represents a message sent in a text channel. Contains `content`, timestamps, and references to the `sender` (`UserEntity`) and `channel` (`ChannelEntity`).

## 2. REST APIs

The backend provides the following HTTP REST endpoints to manage Guilds and Channels. All endpoints require an authenticated user (via JWT).

### Guilds

*   `POST /api/guilds`
    *   **Description**: Create a new guild.
    *   **Request Body**: `{ "name": "My Server", "iconUrl": "..." }`
    *   **Response**: `GuildResponse`
*   `GET /api/guilds/me`
    *   **Description**: Fetch all guilds the current authenticated user is a member of.
    *   **Response**: `List<GuildResponse>`
*   `GET /api/guilds/{guildId}`
    *   **Description**: Fetch details of a specific guild. Verifies the user is a member.
    *   **Response**: `GuildResponse`

### Channels

*   `POST /api/guilds/{guildId}/channels`
    *   **Description**: Create a new channel in a specific guild.
    *   **Request Body**: `{ "name": "general", "type": "TEXT" }`
    *   **Response**: `ChannelResponse`
*   `GET /api/guilds/{guildId}/channels`
    *   **Description**: List all channels for a specific guild, ordered by creation date.
    *   **Response**: `List<ChannelResponse>`
*   `GET /api/guilds/{guildId}/channels/{channelId}/messages`
    *   **Description**: Fetch paginated message history for a channel.
    *   **Query Params**: `page` (default 0), `size` (default 50)
    *   **Response**: `List<ChannelMessageResponse>` (ordered chronologically)

## 3. Real-Time WebSockets (STOMP)

For real-time channel messaging, we utilize Spring's STOMP over WebSocket broker.

### Sending Messages
*   **Destination**: `/app/channels/{channelId}/messages`
*   **Payload**: `StompChannelMessageRequest` (`{ "content": "Hello World!" }`)
*   **Action**: The server receives this, persists the `ChannelMessageEntity` to the database, and then broadcasts it.

### Subscribing to Messages
*   **Destination**: `/topic/channels.{channelId}`
*   **Action**: Clients should subscribe to this topic to receive real-time updates when any user sends a message to the channel. The payload received will be a `ChannelMessageResponse`.

## 4. Next Steps for Frontend Integration
1.  **State Management**: Create a `GuildContext` to fetch `/api/guilds/me` on login and manage the "selected" guild.
2.  **Channel List**: When a guild is selected, fetch `/api/guilds/{guildId}/channels` and render the channel sidebar.
3.  **Chat View**: When a text channel is selected, fetch the history (`/messages`) and subscribe to `/topic/channels.{channelId}` via the STOMP client.
