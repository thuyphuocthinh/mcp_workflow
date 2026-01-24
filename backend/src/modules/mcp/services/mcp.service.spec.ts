import { Test, TestingModule } from '@nestjs/testing';
import { McpService } from './mcp.service';
import { getModelToken } from '@nestjs/mongoose';

describe('McpService', () => {
  let service: McpService;

  const mockToolModel = {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockUserToolAuthModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        {
          provide: getModelToken('Tool'),
          useValue: mockToolModel,
        },
        {
          provide: getModelToken('UserToolAuth'),
          useValue: mockUserToolAuthModel,
        },
      ],
    }).compile();

    service = module.get<McpService>(McpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
