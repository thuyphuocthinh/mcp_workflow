import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getDriveClient } from "../helpers/driveClient.js";

/**
 * Create a new folder in Google Drive
 */
export function registerCreateFolderTool(server: McpServer) {
  server.registerTool(
    "createFolder",
    {
      title: "Create Folder",
      description: "Create a new folder in Google Drive",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        name: z.string().describe("Folder name"),
        parentId: z.string().optional().describe("Parent folder ID (optional)"),
      },
    },
    withErrorHandling("createFolder", async (args: { accessToken: string; name: string; parentId?: string }) => {
      const { accessToken, name, parentId } = args;
      const drive = getDriveClient(accessToken);

      const res = await drive.files.create({
        requestBody: {
          name,
          mimeType: "application/vnd.google-apps.folder",
          parents: parentId ? [parentId] : undefined,
        },
        fields: "id, name, webViewLink",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Folder created!\nID: ${res.data.id}\nName: ${res.data.name}\nLink: ${res.data.webViewLink}`,
          },
        ],
      };
    })
  );
}
