// node-registry.ts
import { Injectable } from '@nestjs/common';
import { WorkflowState } from '../types/langraph.types';
import { LLMService } from '../services/llm.service';
import { FALLBACK_PROMPT } from '../constants/graph.constants';

@Injectable()
export class NodeRegistry {
  constructor(private readonly llmService: LLMService) {}

  llm() {
    return async (state: WorkflowState) => {
      const prompt = state.input?.trim() || FALLBACK_PROMPT;

      const output = await this.llmService.call(prompt);

      return {
        input: prompt,
        output,
      };
    };
  }


  evaluator() {
    return async (state: WorkflowState) => {
      const ok = Boolean(state.output && state.output.length > 50);

      return {
        input: state.input,
        ok,
        retryCount: ok ? 0 : 1,
      };
    };
  }
}
