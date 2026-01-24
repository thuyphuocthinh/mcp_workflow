import { Test, TestingModule } from '@nestjs/testing';
import { MCPClientService } from './mcp-client.service';
import { ConfigService } from '@nestjs/config';

describe('MCPClientService', () => {
  let service: MCPClientService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MCPClientService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MCPClientService>(MCPClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
