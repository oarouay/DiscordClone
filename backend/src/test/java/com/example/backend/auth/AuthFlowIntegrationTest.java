package com.example.backend.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerReturnsTokenAndUser() throws Exception {
        String requestBody = """
                {
                  "username":"john_auth_1",
                  "displayName":"John Doe",
                  "email":"john_auth_1@example.com",
                  "password":"password123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.id").value(org.hamcrest.Matchers.startsWith("u_")))
                .andExpect(jsonPath("$.user.username").value("john_auth_1"))
                .andExpect(jsonPath("$.user.status").value("online"));
    }

    @Test
    void loginAndMeFlowWorksWithBearerToken() throws Exception {
        String registerBody = """
                {
                  "username":"john_auth_2",
                  "displayName":"John Two",
                  "email":"john_auth_2@example.com",
                  "password":"password123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody)).andExpect(status().isCreated());

        String loginBody = """
                {
                  "email":"john_auth_2@example.com",
                  "password":"password123"
                }
                """;

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = root.path("token").asText();

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john_auth_2@example.com"))
                .andExpect(jsonPath("$.status").value("online"));
    }

    @Test
    void registerDuplicateEmailReturnsConflict() throws Exception {
        String first = """
                {
                  "username":"john_auth_3",
                  "displayName":"John Three",
                  "email":"john_auth_3@example.com",
                  "password":"password123"
                }
                """;

        String second = """
                {
                  "username":"john_auth_4",
                  "displayName":"John Four",
                  "email":"john_auth_3@example.com",
                  "password":"password123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(first))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(second))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already exists"));
    }
}

