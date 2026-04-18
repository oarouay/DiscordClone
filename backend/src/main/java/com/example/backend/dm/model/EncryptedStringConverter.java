package com.example.backend.dm.model;

import com.example.backend.dm.service.MessageCryptoService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String>, ApplicationContextAware {

    private static MessageCryptoService cryptoService;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        cryptoService = applicationContext.getBean(MessageCryptoService.class);
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
