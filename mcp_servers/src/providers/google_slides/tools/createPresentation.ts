import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getSlidesClient } from "../helpers/slidesClient.js";

/**
 * Create a new presentation
 */
export function registerCreatePresentationTool(server: McpServer) {
  server.registerTool(
    "createPresentation",
    {
      title: "Create Presentation",
      description: "Create a new Google Slides presentation",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        title: z.string().describe("Presentation title"),
      },
    },
    withErrorHandling("createPresentation", async (args: { accessToken: string; title: string }) => {
      const { accessToken, title } = args;
      const slides = getSlidesClient(accessToken);

      const res = await slides.presentations.create({
        requestBody: {
          title,
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Presentation created!\nID: ${res.data.presentationId}\nTitle: ${res.data.title}`,
          },
        ],
      };
    })
  );
}
