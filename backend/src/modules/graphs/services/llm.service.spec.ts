import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { ConfigService } from '@nestjs/config';
import { ModelKeyService } from '../../models/services/modelKey.service';

describe('LLMService', () => {
  let service: LLMService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockModelKeyService = {
    getDecryptedKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LLMService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ModelKeyService,
          useValue: mockModelKeyService,
        },
      ],
    }).compile();

    service = module.get<LLMService>(LLMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
