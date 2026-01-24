import { Test, TestingModule } from '@nestjs/testing';
import { GraphService } from './graphs.service';
import { getModelToken } from '@nestjs/mongoose';
import { Graph } from '../schemas/graphs.schema';
import { WorkflowRuntimeService } from './workflow.service';
import { Types } from 'mongoose';

describe('GraphService', () => {
  let service: GraphService;

  const mockGraphModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockWorkflowRuntimeService = {
    runStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        {
          provide: getModelToken(Graph.name),
          useValue: mockGraphModel,
        },
        {
          provide: WorkflowRuntimeService,
          useValue: mockWorkflowRuntimeService,
        },
      ],
    }).compile();

    service = module.get<GraphService>(GraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGraph', () => {
    it('should create a graph successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const dto = { name: 'Test Graph', description: 'Test Description' };
      const expectedGraph = {
        ...dto,
        user_id: userId,
        populate: jest.fn().mockReturnValue({
          ...dto,
          user_id: {
            _id: userId,
            email: 'test@example.com',
            name: 'Test User',
          },
          nodes: [],
          edges: [],
          toObject: jest.fn().mockReturnValue({
            ...dto,
            user_id: {
              _id: userId,
              email: 'test@example.com',
              name: 'Test User',
            },
            nodes: [],
            edges: [],
          }),
        }),
      };

      mockGraphModel.create.mockResolvedValue(expectedGraph);

      const result = await service.createGraph(userId, dto);
      expect(result.data).toBeDefined();
      expect(mockGraphModel.create).toHaveBeenCalled();
    });
  });
});
