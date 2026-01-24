/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSearchTool } from './search.js';
import * as GoogleSearchUtil from '../../../utils/googleSearch.util.js';

// Mock the googleSearch utility
vi.mock('../../../utils/googleSearch.util.js', () => ({
  googleSearch: vi.fn(),
}));

describe('google_search/search', () => {
  let mockServer: any;
  let registeredTool: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };
  });

  it('should register the search tool', () => {
    registerSearchTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'search',
      expect.objectContaining({
        title: 'Search Web',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should call googleSearch with correct arguments', async () => {
    (GoogleSearchUtil.googleSearch as any).mockResolvedValue([
      { title: 'Test Result', link: 'http://example.com' },
    ]);

    registerSearchTool(mockServer);
    const result = await registeredTool({ query: 'vitest', limit: 5 });

    expect(GoogleSearchUtil.googleSearch).toHaveBeenCalledWith('vitest', 5);
    expect(result.content[0].text).toContain('Test Result');
  });

  it('should use default limit if not provided', async () => {
    (GoogleSearchUtil.googleSearch as any).mockResolvedValue([]);

    registerSearchTool(mockServer);
    await registeredTool({ query: 'vitest' });

    expect(GoogleSearchUtil.googleSearch).toHaveBeenCalledWith('vitest', 3);
  });
});
