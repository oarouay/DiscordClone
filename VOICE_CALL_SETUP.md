# Voice Call Feature Setup Guide

This document provides instructions for setting up and running the new global voice call feature in the application.

## Feature Overview

The voice call functionality is built using WebRTC for peer-to-peer audio communication. The signaling required to establish the connection is handled by a STOMP-over-WebSocket server running on the backend.

- **Frontend**: A Next.js application that uses a global React Context (`GlobalVoiceCallContext`) to manage call state. The UI is rendered via the `GlobalVoiceCallUI` component, which is available throughout the application.
- **Backend**: A Java Spring Boot application that provides the WebSocket endpoint for STOMP-based signaling.

---

## Backend Setup

The backend is configured to run on port `8081` to avoid conflicts with the frontend development server.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Run the Spring Boot application:**
    ```bash
    ./mvnw spring-boot:run
    ```
    The backend server will start and listen for WebSocket connections on `http://localhost:8081`.

---

## Frontend Setup

The frontend needs to know the address of the backend signaling server. This is configured using an environment variable.

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Create a local environment file:**
    Create a new file named `.env.local` inside the `frontend` directory.

3.  **Add the environment variable:**
    Add the following line to your new `.env.local` file. This tells the frontend to connect to the backend server we started in the previous step.

    ```
    NEXT_PUBLIC_STOMP_URL=http://localhost:8081/ws-stomp
    ```

4.  **Install dependencies:**
    If you haven't already, install the necessary Node.js packages.
    ```bash
    npm install
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend application will start, typically on `http://localhost:3000`.

---

## How It Works

- When a user initiates a call, the frontend sends a `CALL_INITIATE` message via the STOMP WebSocket connection.
- The backend routes this message to the recipient.
- The recipient's client receives the message and displays the incoming call UI.
- If accepted, a series of WebRTC offer/answer and ICE candidate messages are exchanged through the signaling server to establish a direct peer-to-peer connection.
- Once connected, audio data flows directly between the users' browsers.
