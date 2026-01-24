/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCreateDocTool } from './createDoc.js';
import * as DocsClientHelper from '../helpers/docsClient.js';

// Mock the googleDocsRequest helper
vi.mock('../helpers/docsClient.js', () => ({
  googleDocsRequest: vi.fn(),
}));

describe('google_docs/createDoc', () => {
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

  it('should register the createDoc tool', () => {
    registerCreateDocTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'createDoc',
      expect.objectContaining({
        title: 'Create Google Doc',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should create a document correctly', async () => {
    (DocsClientHelper.googleDocsRequest as any).mockResolvedValue({
      documentId: 'doc123',
      title: 'New Doc',
    });

    registerCreateDocTool(mockServer);
    const result = await registeredTool({ accessToken: 'fake_token', title: 'New Doc' });

    expect(DocsClientHelper.googleDocsRequest).toHaveBeenCalledWith(
      'fake_token',
      '/documents',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('New Doc'),
      }),
    );
    expect(result.content[0].text).toContain('ID: doc123');
    expect(result.content[0].text).toContain('Title: New Doc');
  });
});
