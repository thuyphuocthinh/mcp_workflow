import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './crypto.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
  let service: EncryptionService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('12345678901234567890123456789012'), // 32 chars
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt correctly', () => {
    const text = 'hello world';
    const encrypted = service.encrypt(text);
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(text);
  });
});
