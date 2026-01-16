import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getCalendarClient } from "../helpers/calendarClient.js";

interface CreateEventArgs {
  accessToken: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
}

/**
 * Create a new calendar event
 */
export function registerCreateEventTool(server: McpServer) {
  server.registerTool(
    "createEvent",
    {
      title: "Create Calendar Event",
      description: "Create a new event in Google Calendar",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        summary: z.string().describe("Event title"),
        description: z.string().optional().describe("Event description"),
        startDateTime: z.string().describe("Start time in ISO format (e.g., 2024-01-20T10:00:00+07:00)"),
        endDateTime: z.string().describe("End time in ISO format"),
      },
    },
    withErrorHandling("createEvent", async (args: CreateEventArgs) => {
      const { accessToken, summary, description, startDateTime, endDateTime } = args;
      const calendar = getCalendarClient(accessToken);

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary,
          description,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Event created!\nID: ${res.data.id}\nTitle: ${res.data.summary}\nLink: ${res.data.htmlLink}`,
          },
        ],
      };
    })
  );
}
