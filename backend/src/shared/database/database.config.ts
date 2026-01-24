import { ConfigService } from '@nestjs/config';
import type { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongoConfig = (
  config: ConfigService,
): MongooseModuleOptions => {
  const uri = config.get<string>('MONGODB_URI');

  return {
    uri,

    /* ===== Connection ===== */
    connectTimeoutMS: 10_000,     // timeout khi connect
    socketTimeoutMS: 45_000,      // timeout cho socket
    serverSelectionTimeoutMS: 10_000,

    /* ===== Retry ===== */
    retryAttempts: 5,             // NestJS-level retry
    retryDelay: 3000,             // ms

    /* ===== Pool ===== */
    maxPoolSize: 10,              // đủ cho side project
    minPoolSize: 2,

    /* ===== Stability ===== */
    heartbeatFrequencyMS: 10_000,
    autoIndex: true,              // dev = true

    /* ===== Debug ===== */
    // bufferCommands: false,     // bật nếu muốn fail fast
  };
};
