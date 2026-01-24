import { Test, TestingModule } from '@nestjs/testing';
import { UserToolAuthService } from './mcp-auth.service';
import { getModelToken } from '@nestjs/mongoose';

describe('UserToolAuthService', () => {
  let service: UserToolAuthService;

  const mockUserToolAuthModel = {
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserToolAuthService,
        {
          provide: getModelToken('UserToolAuth'),
          useValue: mockUserToolAuthModel,
        },
      ],
    }).compile();

    service = module.get<UserToolAuthService>(UserToolAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
