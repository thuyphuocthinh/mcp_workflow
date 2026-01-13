// Minimal MCP server implementing JSON-RPC over WebSocket
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 }, () => {
  console.log("MCP Server listening on ws://localhost:3001");
});

// Define some fake tools
const tools = {
  "sheets.appendRows": {
    description: "Append rows to a sheet",
    implementation: async ({ rows }) => ({
      rowsAppended: rows.length,
      summary: rows.reduce((sum, r) => sum + (r.amount || 0), 0),
    }),
  },
  "docs.generate": {
    description: "Generate a doc",
    implementation: async ({ data }) => {
      const customer = data?.customer?.name || "Unknown";
      const title = data?.title || "Untitled";
      const content =
        data?.content || `Report for ${customer} - ${title} (auto-generated)`;

      return {
        docId: "DOC_" + Math.random().toString(36).slice(2, 8),
        url: "http://localhost:3001/docs/fake.pdf",
        content,
      };
    },
  },
  "docs.rename": {
    description: "Rename a doc",
    implementation: async ({ data }) => {
      const oldName = data?.oldName || "Unknown";
      const newName = data?.newName || "Unknown";
      const content = oldName + newName;

      return {
        docId: "DOC_" + Math.random().toString(36).slice(2, 8),
        url: "http://localhost:3001/docs/fake.pdf",
        content,
      };
    },
  },
  "mail.send": {
    description: "Send an email",
    implementation: async ({ to, subject, body }) => ({
      messageId: "MSG_" + Math.random().toString(36).slice(2, 8),
      status: "sent",
    }),
  },
};

// Helpers to respond JSON-RPC
const makeResponse = (id, result) =>
  JSON.stringify({ jsonrpc: "2.0", id, result });
const makeError = (id, code, message) =>
  JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });

wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      ws.send(makeError(null, -32700, "Parse error"));
      return;
    }

    const { id, method, params } = data;

    if (method === "get_tools") {
      const meta = Object.keys(tools).map((name) => ({
        name,
        description: tools[name].description,
      }));
      ws.send(makeResponse(id, { tools: meta }));
      return;
    }

    if (method === "call_tool") {
      const { name, arguments: args } = params;
      const tool = tools[name];
      if (!tool) {
        ws.send(makeError(id, -32601, "Tool not found"));
        return;
      }
      try {
        const result = await tool.implementation(args || {});
        ws.send(makeResponse(id, { result }));
      } catch (err) {
        ws.send(makeError(id, -32000, err.message));
      }
      return;
    }

    ws.send(makeError(id, -32601, `Unknown method ${method}`));
  });

  ws.send(
    JSON.stringify({
      jsonrpc: "2.0",
      method: "server_ready",
      params: { message: "MCP server ready" },
    })
  );
});
