import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getCalendarClient } from "../helpers/calendarClient.js";

/**
 * List upcoming events from Google Calendar
 */
export function registerListEventsTool(server: McpServer) {
  server.registerTool(
    "listEvents",
    {
      title: "List Calendar Events",
      description: "List upcoming events from Google Calendar",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        maxResults: z.number().optional().default(10).describe("Max events to return"),
      },
    },
    withErrorHandling("listEvents", async (args: { accessToken: string; maxResults: number }) => {
      const { accessToken, maxResults } = args;
      const calendar = getCalendarClient(accessToken);

      const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = res.data.items ?? [];
      const formatted = events.map((e) => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(formatted, null, 2),
          },
        ],
      };
    })
  );
}
