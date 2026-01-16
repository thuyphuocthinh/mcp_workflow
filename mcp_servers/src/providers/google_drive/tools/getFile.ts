import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getDriveClient } from "../helpers/driveClient.js";

/**
 * Get file metadata by ID
 */
export function registerGetFileTool(server: McpServer) {
  server.registerTool(
    "getFile",
    {
      title: "Get File",
      description: "Get file metadata from Google Drive",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        fileId: z.string().describe("File ID"),
      },
    },
    withErrorHandling("getFile", async (args: { accessToken: string; fileId: string }) => {
      const { accessToken, fileId } = args;
      const drive = getDriveClient(accessToken);

      const res = await drive.files.get({
        fileId,
        fields: "id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    })
  );
}
