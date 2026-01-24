/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerListFilesTool } from './listFiles.js';
import * as DriveClientHelper from '../helpers/driveClient.js';

// Mock the getDriveClient helper
vi.mock('../helpers/driveClient.js', () => ({
  getDriveClient: vi.fn(),
}));

describe('google_drive/listFiles', () => {
  let mockServer: any;
  let registeredTool: any;
  let mockDrive: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };

    mockDrive = {
      files: {
        list: vi.fn(),
      },
    };

    (DriveClientHelper.getDriveClient as any).mockReturnValue(mockDrive);
  });

  it('should register the listFiles tool', () => {
    registerListFilesTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'listFiles',
      expect.objectContaining({
        title: 'List Files',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should list files correctly', async () => {
    mockDrive.files.list.mockResolvedValue({
      data: {
        files: [
          { id: 'file1', name: 'File A' },
          { id: 'file2', name: 'File B' },
        ],
      },
    });

    registerListFilesTool(mockServer);
    const result = await registeredTool({ accessToken: 'fake_token', maxResults: 5 });

    expect(DriveClientHelper.getDriveClient).toHaveBeenCalledWith('fake_token');
    expect(mockDrive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 5,
      }),
    );
    expect(result.content[0].text).toContain('File A');
    expect(result.content[0].text).toContain('File B');
  });

  it('should handle search query', async () => {
    mockDrive.files.list.mockResolvedValue({ data: { files: [] } });

    registerListFilesTool(mockServer);
    await registeredTool({ accessToken: 'fake_token', query: 'name = "test"' });

    expect(mockDrive.files.list).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'name = "test"',
      }),
    );
  });
});
