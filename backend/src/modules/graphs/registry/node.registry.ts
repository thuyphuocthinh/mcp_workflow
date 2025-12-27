// node-registry.ts
import { Injectable } from '@nestjs/common';
import { WorkflowState } from '../types/langraph.types';
import { LLMService } from '../services/llm.service';

@Injectable()
export class NodeRegistry {
  constructor(
    private readonly llmService: LLMService,
  ) {}

  llm() {
    return async (state: WorkflowState) => {
      const output = await this.llmService.call(state.input);
      return { output };
    };
  }

  evaluator() {
    return async (state: WorkflowState) => {
      const ok = !!state.output && state.output.length > 50;

      return {
        ok,
        retryCount: state.retryCount + (ok ? 0 : 1),
      };
    };
  }
}
