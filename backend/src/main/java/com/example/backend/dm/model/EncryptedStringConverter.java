package com.example.backend.dm.model;

import com.example.backend.dm.service.MessageCryptoService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static MessageCryptoService cryptoService;

    public static void setCryptoService(MessageCryptoService service) {
        cryptoService = service;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (cryptoService == null || attribute == null) {
            return attribute;
        }
        return cryptoService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (cryptoService == null || dbData == null) {
            return dbData;
        }
        return cryptoService.decrypt(dbData);
    }
}
