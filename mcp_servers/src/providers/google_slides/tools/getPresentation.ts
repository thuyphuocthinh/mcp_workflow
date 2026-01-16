import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getSlidesClient } from "../helpers/slidesClient.js";

/**
 * Get a presentation by ID
 */
export function registerGetPresentationTool(server: McpServer) {
  server.registerTool(
    "getPresentation",
    {
      title: "Get Presentation",
      description: "Get a Google Slides presentation by ID",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        presentationId: z.string().describe("Presentation ID"),
      },
    },
    withErrorHandling("getPresentation", async (args: { accessToken: string; presentationId: string }) => {
      const { accessToken, presentationId } = args;
      const slides = getSlidesClient(accessToken);

      const res = await slides.presentations.get({
        presentationId,
      });

      const presentation = {
        id: res.data.presentationId,
        title: res.data.title,
        slideCount: res.data.slides?.length ?? 0,
        locale: res.data.locale,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(presentation, null, 2),
          },
        ],
      };
    })
  );
}
