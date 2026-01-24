/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerEvaluateTool } from './evaluate.js';

describe('calculator/evaluate', () => {
  let mockServer: any;
  let registeredTool: any;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };
  });

  it('should register the evaluate tool', () => {
    registerEvaluateTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'evaluate',
      expect.objectContaining({
        title: 'Evaluate Expression',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should calculate basic arithmetic correctly', async () => {
    registerEvaluateTool(mockServer);
    const result = await registeredTool({ expression: '2 + 3' });
    expect(result.content[0].text).toContain('5');
  });

  it('should handle complex expressions', async () => {
    registerEvaluateTool(mockServer);
    const result = await registeredTool({ expression: '(2 + 3) * 4' });
    expect(result.content[0].text).toContain('20');
  });

  // Since we are mocking the handler execution context, error handling might need
  // to be tested via the error wrapper or by ensuring the tool throws/returns error
  // depending on how withErrorHandling is implemented.
  // For now, testing the happy path of the logic.
});
