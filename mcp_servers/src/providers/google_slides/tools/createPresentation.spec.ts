/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCreatePresentationTool } from './createPresentation.js';
import * as SlidesClientHelper from '../helpers/slidesClient.js';

// Mock the getSlidesClient helper
vi.mock('../helpers/slidesClient.js', () => ({
  getSlidesClient: vi.fn(),
}));

describe('google_slides/createPresentation', () => {
  let mockServer: any;
  let registeredTool: any;
  let mockSlides: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };

    mockSlides = {
      presentations: {
        create: vi.fn(),
      },
    };

    (SlidesClientHelper.getSlidesClient as any).mockReturnValue(mockSlides);
  });

  it('should register the createPresentation tool', () => {
    registerCreatePresentationTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'createPresentation',
      expect.objectContaining({
        title: 'Create Presentation',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should create a presentation correctly', async () => {
    mockSlides.presentations.create.mockResolvedValue({
      data: {
        presentationId: 'pres1',
        title: 'My Slides',
      },
    });

    registerCreatePresentationTool(mockServer);
    const result = await registeredTool({ accessToken: 'fake_token', title: 'My Slides' });

    expect(SlidesClientHelper.getSlidesClient).toHaveBeenCalledWith('fake_token');
    expect(mockSlides.presentations.create).toHaveBeenCalledWith({
      requestBody: {
        title: 'My Slides',
      },
    });
    expect(result.content[0].text).toContain('ID: pres1');
  });
});
