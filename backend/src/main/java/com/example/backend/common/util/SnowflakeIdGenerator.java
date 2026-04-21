package com.example.backend.common.util;

import java.time.Instant;

/**
 * Generates unique 64-bit integer identifiers mathematically identical to Discord's Snowflake structure.
 * This guarantees highly optimal PostgreSQL B-Tree insertion and zero fragmentation.
 */
public class SnowflakeIdGenerator {
    // Custom Epoch (Jan 1, 2024)
    private static final long CUSTOM_EPOCH = 1704067200000L;
    
    private static final long WORKER_ID_BITS = 5L;
    private static final long DATACENTER_ID_BITS = 5L;
    private static final long SEQUENCE_BITS = 12L;

    private static final long MAX_WORKER_ID = ~(-1L << WORKER_ID_BITS);
    private static final long MAX_DATACENTER_ID = ~(-1L << DATACENTER_ID_BITS);

    private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;
    private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
    private static final long TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS;

    private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);

    private long workerId;
    private long datacenterId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    private static final SnowflakeIdGenerator defaultInstance = new SnowflakeIdGenerator(1, 1);

    public SnowflakeIdGenerator(long workerId, long datacenterId) {
        if (workerId > MAX_WORKER_ID || workerId < 0) {
            throw new IllegalArgumentException(String.format("Worker ID can't be greater than %d or less than 0", MAX_WORKER_ID));
        }
        if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
            throw new IllegalArgumentException(String.format("Datacenter ID can't be greater than %d or less than 0", MAX_DATACENTER_ID));
        }
        this.workerId = workerId;
        this.datacenterId = datacenterId;
    }

    public static long generate() {
        return defaultInstance.nextId();
    }

    public synchronized long nextId() {
        long timestamp = timeGen();

        if (timestamp < lastTimestamp) {
            throw new RuntimeException(String.format("Clock moved backwards. Refusing to generate id for %d milliseconds", lastTimestamp - timestamp));
        }

        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            if (sequence == 0) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - CUSTOM_EPOCH) << TIMESTAMP_LEFT_SHIFT)
                | (datacenterId << DATACENTER_ID_SHIFT)
                | (workerId << WORKER_ID_SHIFT)
                | sequence;
    }

    protected long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    protected long timeGen() {
        return Instant.now().toEpochMilli();
    }
}
