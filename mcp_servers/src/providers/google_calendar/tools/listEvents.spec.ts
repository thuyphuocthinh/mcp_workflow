/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerListEventsTool } from './listEvents.js';
import * as CalendarClientHelper from '../helpers/calendarClient.js';

// Mock the getCalendarClient helper
vi.mock('../helpers/calendarClient.js', () => ({
  getCalendarClient: vi.fn(),
}));

describe('google_calendar/listEvents', () => {
  let mockServer: any;
  let registeredTool: any;
  let mockCalendar: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      registerTool: vi.fn((name, def, handler) => {
        registeredTool = handler;
      }),
    };

    mockCalendar = {
      events: {
        list: vi.fn(),
      },
    };

    (CalendarClientHelper.getCalendarClient as any).mockReturnValue(mockCalendar);
  });

  it('should register the listEvents tool', () => {
    registerListEventsTool(mockServer);
    expect(mockServer.registerTool).toHaveBeenCalledWith(
      'listEvents',
      expect.objectContaining({
        title: 'List Calendar Events',
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );
  });

  it('should list events correctly', async () => {
    const now = new Date();
    mockCalendar.events.list.mockResolvedValue({
      data: {
        items: [
          {
            id: 'ev1',
            summary: 'Meeting',
            start: { dateTime: now.toISOString() },
            end: { dateTime: now.toISOString() },
          },
        ],
      },
    });

    registerListEventsTool(mockServer);
    const result = await registeredTool({ accessToken: 'fake_token', maxResults: 5 });

    expect(CalendarClientHelper.getCalendarClient).toHaveBeenCalledWith('fake_token');
    expect(mockCalendar.events.list).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        maxResults: 5,
      }),
    );
    expect(result.content[0].text).toContain('Meeting');
  });
});
