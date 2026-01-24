import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getCalendarClient } from "../helpers/calendarClient.js";

/**
 * Delete a calendar event
 */
export function registerDeleteEventTool(server: McpServer) {
  server.registerTool(
    "deleteEvent",
    {
      title: "Delete Calendar Event",
      description: "Delete an event from Google Calendar",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        eventId: z.string().describe("Event ID to delete"),
      },
    },
    withErrorHandling("deleteEvent", async (args: { accessToken: string; eventId: string }) => {
      const { accessToken, eventId } = args;
      const calendar = getCalendarClient(accessToken);

      await calendar.events.delete({
        calendarId: "primary",
        eventId,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Event ${eventId} deleted successfully`,
          },
        ],
      };
    })
  );
}
