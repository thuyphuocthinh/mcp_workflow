import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getDriveClient } from "../helpers/driveClient.js";

/**
 * Delete a file from Google Drive
 */
export function registerDeleteFileTool(server: McpServer) {
  server.registerTool(
    "deleteFile",
    {
      title: "Delete File",
      description: "Delete a file from Google Drive",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        fileId: z.string().describe("File ID to delete"),
      },
    },
    withErrorHandling("deleteFile", async (args: { accessToken: string; fileId: string }) => {
      const { accessToken, fileId } = args;
      const drive = getDriveClient(accessToken);

      await drive.files.delete({
        fileId,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `File ${fileId} deleted successfully`,
          },
        ],
      };
    })
  );
}
