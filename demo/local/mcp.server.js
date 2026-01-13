const express = require("express");
const app = express();
app.use(express.json());

// Tool fake: ghi dữ liệu
app.post("/callTool", (req, res) => {
  const { name, arguments: args } = req.body;
  if (name === "sheets.appendRows") {
    console.log("Appending rows:", args.rows);
    return res.json({ status: "ok", rowsAppended: args.rows.length });
  }
  if (name === "docs.generate") {
    return res.json({ status: "ok", docId: "DOC123", url: "/docs/report.pdf" });
  }
  if (name === "mail.send") {
    return res.json({ status: "ok", messageId: "MSG456" });
  }
  res.status(400).json({ error: "Tool not found" });
});

// Metadata endpoint
app.get("/metadata", (req, res) => {
  res.json({
    tools: {
      "sheets.appendRows": {
        description: "Ghi rows vào Sheets",
        inputSchema: { rows: "array" },
        outputSchema: { rowsAppended: "number" },
      },
      "docs.generate": {
        description: "Tạo Docs",
        inputSchema: { data: "object" },
        outputSchema: { docId: "string", url: "string" },
      },
      "mail.send": {
        description: "Gửi email",
        inputSchema: { to: "array", subject: "string", body: "string" },
        outputSchema: { messageId: "string" },
      },
    },
  });
});

app.listen(3000, () => console.log("MCP Server running on port 3000"));
