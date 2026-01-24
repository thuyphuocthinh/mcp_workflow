import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getSlidesClient } from "../helpers/slidesClient.js";

/**
 * Add a new slide to a presentation
 */
export function registerAddSlideTool(server: McpServer) {
  server.registerTool(
    "addSlide",
    {
      title: "Add Slide",
      description: "Add a new slide to a Google Slides presentation",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        presentationId: z.string().describe("Presentation ID"),
        layout: z.enum(["BLANK", "TITLE", "TITLE_AND_BODY"]).optional().default("BLANK").describe("Slide layout"),
      },
    },
    withErrorHandling("addSlide", async (args: { accessToken: string; presentationId: string; layout: string }) => {
      const { accessToken, presentationId, layout } = args;
      const slides = getSlidesClient(accessToken);

      const layoutMap: Record<string, string> = {
        BLANK: "BLANK",
        TITLE: "TITLE",
        TITLE_AND_BODY: "TITLE_AND_BODY",
      };

      const res = await slides.presentations.batchUpdate({
        presentationId,
        requestBody: {
          requests: [
            {
              createSlide: {
                slideLayoutReference: {
                  predefinedLayout: layoutMap[layout] || "BLANK",
                },
              },
            },
          ],
        },
      });

      const slideId = res.data.replies?.[0]?.createSlide?.objectId;

      return {
        content: [
          {
            type: "text" as const,
            text: `Slide added!\nSlide ID: ${slideId}`,
          },
        ],
      };
    })
  );
}
