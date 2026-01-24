import { Test, TestingModule } from '@nestjs/testing';
import { ModelKeyService } from './modelKey.service';
import { getModelToken } from '@nestjs/mongoose';
import { ModelKey } from '../schemas/modelKey.schema';
import { EncryptionService } from './crypto.service';

describe('ModelKeyService', () => {
  let service: ModelKeyService;

  const mockModelKeyModel = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEncryptionService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelKeyService,
        {
          provide: getModelToken(ModelKey.name),
          useValue: mockModelKeyModel,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<ModelKeyService>(ModelKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
