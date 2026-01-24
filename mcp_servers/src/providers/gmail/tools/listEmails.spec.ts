/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerListEmailsTool } from './listEmails.js';
import * as GmailClientHelper from '../helpers/gmailClient.js';

// Mock the getGmailClient helper
vi.mock('../helpers/gmailClient.js', () => ({
  getGmailClient: vi.fn(),
}));

describe('gmail/listEmails', () => {
  let mockServer: any;
  let registeredTool: any;
  let mockGmail: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };

    mockGmail = {
      users: {
        messages: {
          list: vi.fn(),
        },
      },
    };

    (GmailClientHelper.getGmailClient as any).mockReturnValue(mockGmail);
  });

  it('should register the listEmails tool', () => {
    registerListEmailsTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'listEmails',
      expect.objectContaining({
        title: 'List Emails',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should list emails correctly', async () => {
    mockGmail.users.messages.list.mockResolvedValue({
      data: {
        messages: [
          { id: '123', threadId: 'thread1' },
          { id: '456', threadId: 'thread2' },
        ],
      },
    });

    registerListEmailsTool(mockServer);
    const result = await registeredTool({ accessToken: 'fake_token', maxResults: 10 });

    expect(GmailClientHelper.getGmailClient).toHaveBeenCalledWith('fake_token');
    expect(mockGmail.users.messages.list).toHaveBeenCalledWith({
      userId: 'me',
      maxResults: 10,
    });
    expect(result.content[0].text).toContain('thread1');
    expect(result.content[0].text).toContain('thread2');
  });

  it('should handle empty response', async () => {
    mockGmail.users.messages.list.mockResolvedValue({
      data: {},
    });

    registerListEmailsTool(mockServer);
    const result = await registeredTool({ accessToken: 'fake_token' });

    expect(result.content[0].text).toBe('[]');
  });
});
