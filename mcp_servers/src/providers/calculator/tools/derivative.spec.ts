/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerDerivativeTool } from './derivative.js';

describe('calculator/derivative', () => {
  let mockServer: any;
  let registeredTool: any;

  beforeEach(() => {
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };
  });

  it('should register the derivative tool', () => {
    registerDerivativeTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'derivative',
      expect.objectContaining({
        title: 'Derivative',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should compute derivative correctly', async () => {
    registerDerivativeTool(mockServer);
    const result = await registeredTool({ expression: 'x^2', variable: 'x' });
    expect(result.content[0].text).toBe('2 * x');
  });

  it('should compute partial derivative', async () => {
    registerDerivativeTool(mockServer);
    const result = await registeredTool({ expression: 'x^2 + y^2', variable: 'x' });
    expect(result.content[0].text).toBe('2 * x');
  });
});
