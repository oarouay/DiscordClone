package com.example.backend.dm.service;

import com.example.backend.common.exception.ConflictException;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MessageCryptoService {

    private static final String PREFIX = "enc:v1:";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_SIZE_BYTES = 12;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.dm-encryption.key}")
    private String configuredKey;

    private SecretKeySpec secretKey;

    @PostConstruct
    void init() {
        byte[] keyBytes = configuredKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new ConflictException("DM encryption key must be at least 32 bytes");
        }
        byte[] normalized = new byte[32];
        System.arraycopy(keyBytes, 0, normalized, 0, 32);
        this.secretKey = new SecretKeySpec(normalized, "AES");
        com.example.backend.dm.model.EncryptedStringConverter.setCryptoService(this);
    }

    public String encrypt(String clearText) {
        if (clearText == null) {
            return null;
        }

        try {
            byte[] iv = new byte[IV_SIZE_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] encrypted = cipher.doFinal(clearText.getBytes(StandardCharsets.UTF_8));

            byte[] payload = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, payload, 0, iv.length);
            System.arraycopy(encrypted, 0, payload, iv.length, encrypted.length);
            return PREFIX + Base64.getEncoder().encodeToString(payload);
        } catch (Exception ex) {
            throw new ConflictException("Failed to encrypt message");
        }
    }

    public String decrypt(String storedValue) {
        if (storedValue == null) {
            return null;
        }

        if (!storedValue.startsWith(PREFIX)) {
            return storedValue;
        }

        try {
            String encoded = storedValue.substring(PREFIX.length());
            byte[] payload = Base64.getDecoder().decode(encoded);

            if (payload.length <= IV_SIZE_BYTES) {
                throw new ConflictException("Encrypted payload is invalid");
            }

            byte[] iv = new byte[IV_SIZE_BYTES];
            byte[] encrypted = new byte[payload.length - IV_SIZE_BYTES];
            System.arraycopy(payload, 0, iv, 0, IV_SIZE_BYTES);
            System.arraycopy(payload, IV_SIZE_BYTES, encrypted, 0, encrypted.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
            byte[] clearBytes = cipher.doFinal(encrypted);
            return new String(clearBytes, StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new ConflictException("Failed to decrypt message");
        }
    }
}
