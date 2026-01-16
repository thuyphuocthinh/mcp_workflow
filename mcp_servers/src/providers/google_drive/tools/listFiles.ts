import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getDriveClient } from "../helpers/driveClient.js";

/**
 * List files from Google Drive
 */
export function registerListFilesTool(server: McpServer) {
  server.registerTool(
    "listFiles",
    {
      title: "List Files",
      description: "List files from Google Drive",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        maxResults: z.number().optional().default(10).describe("Max files to return"),
        query: z.string().optional().describe("Search query (e.g., name contains 'report')"),
      },
    },
    withErrorHandling("listFiles", async (args: { accessToken: string; maxResults: number; query?: string }) => {
      const { accessToken, maxResults, query } = args;
      const drive = getDriveClient(accessToken);

      const res = await drive.files.list({
        pageSize: maxResults,
        q: query,
        fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
      });

      const files = res.data.files ?? [];

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(files, null, 2),
          },
        ],
      };
    })
  );
}
