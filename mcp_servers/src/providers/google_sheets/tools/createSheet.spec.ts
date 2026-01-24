/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCreateSheetTool } from './createSheet.js';
import * as SheetsStorage from '../helpers/sheetsStorage.js';

// Mock the sheetsStorage helper
vi.mock('../helpers/sheetsStorage.js', () => ({
  readSheets: vi.fn(),
  writeSheets: vi.fn(),
}));

describe('google_sheets/createSheet', () => {
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

  it('should register the createSheet tool', () => {
    registerCreateSheetTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'createSheet',
      expect.objectContaining({
        title: 'Create Sheet',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should create a sheet correctly', async () => {
    (SheetsStorage.readSheets as any).mockResolvedValue([]);
    (SheetsStorage.writeSheets as any).mockResolvedValue(undefined);

    registerCreateSheetTool(mockServer);
    const result = await registeredTool({ title: 'My Sheet', columns: ['A', 'B'] });

    expect(SheetsStorage.readSheets).toHaveBeenCalled();
    expect(SheetsStorage.writeSheets).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 1,
        title: 'My Sheet',
        columns: ['A', 'B'],
        rows: [],
      }),
    ]);
    expect(result.content[0].text).toContain('ID 1');
  });
});
