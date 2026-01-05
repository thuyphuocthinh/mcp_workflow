import { standardize } from './../../util';
// src/providers/google/docs.ts
import { google, docs_v1, drive_v3 } from "googleapis";
import { MCPClient } from "../../base/mcp_client";
import { MCPTool, ToolCallArgs, ToolResult } from "../../types";

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

export class MCPGoogleDocs extends MCPClient {
  private tokens: GoogleTokens;
  private docsClient: docs_v1.Docs;

  constructor(tokens: GoogleTokens) {
    super();
    this.tokens = tokens;
    this.docsClient = this.createDocsClient();
  }

  private createOAuthClient(): any {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );
    oauth2Client.setCredentials(this.tokens);
    return oauth2Client;
  }

  private createDocsClient(): docs_v1.Docs {
    const auth = this.createOAuthClient();
    return google.docs({ version: "v1", auth });
  }

  async fetchTools(): Promise<MCPTool[]> {
    return [
      { name: "createDoc", description: "Create a new Google Docs with a given title" },
      { name: "getDoc", description: "Get the content details of a Google Docs by docId" },
      { name: "appendText", description: "Append text to the end of a Google Docs" },
      { name: "updateText", description: "Update the content of a Google Docs using requests" },
      { name: "listDocs", description: "List the Google Docs in the user's drive" },
      { name: "deleteDoc", description: "Delete a Google Docs by docId" },
    ];
  }

  async callTool(name: string, args: ToolCallArgs): Promise<ToolResult> {
    switch (name) {
      case "createDoc":
        return this.createDoc(args.title);
      case "getDoc":
        return this.getDoc(args.docId);
      case "appendText":
        return this.appendText(args.docId, args.text);
      case "updateText":
        return this.updateText(args.docId, args.requests);
      case "listDocs":
        return this.listDocs();
      case "deleteDoc":
        return this.deleteDoc(args.docId);
      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  }

  // --------------------
  // Tools Implementation
  // --------------------
  private async createDoc(title: string): Promise<ToolResult> {
    return standardize<docs_v1.Schema$Document>(() =>
      this.docsClient.documents.create({ requestBody: { title } }).then(res => res.data)
    );
  }

  private async getDoc(docId: string): Promise<ToolResult> {
    return standardize<docs_v1.Schema$Document>(() =>
      this.docsClient.documents.get({ documentId: docId }).then(res => res.data)
    );
  }

  private async appendText(docId: string, text: string): Promise<ToolResult> {
    return standardize<docs_v1.Schema$BatchUpdateDocumentResponse>(async () => {
      const doc = await this.docsClient.documents.get({ documentId: docId }).then(r => r.data);
      const endIndex = doc.body?.content?.[doc.body.content.length - 1].endIndex || 1;

      const res = await this.docsClient.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            { insertText: { location: { index: endIndex - 1 }, text } },
          ],
        },
      });
      return res.data;
    });
  }

  private async updateText(docId: string, requests: docs_v1.Schema$Request[]): Promise<ToolResult> {
    return standardize<docs_v1.Schema$BatchUpdateDocumentResponse>(() =>
      this.docsClient.documents.batchUpdate({
        documentId: docId,
        requestBody: { requests },
      }).then(res => res.data)
    );
  }

  private async listDocs(): Promise<ToolResult> {
    return standardize<drive_v3.Schema$File[]>(async () => {
      const drive = google.drive({ version: "v3", auth: this.createOAuthClient() });
      const res = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.document'",
        fields: "files(id, name, createdTime)",
        pageSize: 20,
      });
      return res.data.files || [];
    });
  }

  private async deleteDoc(docId: string): Promise<ToolResult> {
    return standardize<{ ok: boolean }>(async () => {
      const drive = google.drive({ version: "v3", auth: this.createOAuthClient() });
      await drive.files.delete({ fileId: docId });
      return { ok: true };
    });
  }
}
