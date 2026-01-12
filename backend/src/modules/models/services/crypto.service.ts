import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('MODEL_KEY_SECRET');

    if (!secret) {
      throw new Error('MODEL_KEY_SECRET is not defined');
    }

    if (secret.length !== 32) {
      throw new Error('MODEL_KEY_SECRET must be exactly 32 characters');
    }

    this.key = Buffer.from(secret, 'utf8');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(encryptedText: string): string {
    const data = Buffer.from(encryptedText, 'base64');

    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      iv,
    );

    decipher.setAuthTag(tag);

    return (
      decipher.update(encrypted, undefined, 'utf8') +
      decipher.final('utf8')
    );
  }
}
