import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowRuntimeService } from './workflow.service';
import { NodeRegistry } from '../registry/node.registry';

describe('WorkflowRuntimeService', () => {
  let service: WorkflowRuntimeService;

  const mockNodeRegistry = {
    createLLMNode: jest.fn(),
    createMCPToolNode: jest.fn(),
    createAgentNode: jest.fn(),
    llm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowRuntimeService,
        {
          provide: NodeRegistry,
          useValue: mockNodeRegistry,
        },
      ],
    }).compile();

    service = module.get<WorkflowRuntimeService>(WorkflowRuntimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
