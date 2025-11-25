require("dotenv").config();
const MCPClient = require("./mcp.client.js");
const { GoogleGenAI } = require("@google/genai");

// --- Hàm strip code block JSON ---
function extractJson(text) {
  const match = text.match(/```(?:json)?\n([\s\S]*?)```/);
  if (match) return match[1].trim();
  return text.trim();
}

// --- Hàm kiểm tra tool arguments theo schema ---
function validateArgs(toolName, args, tools) {
  const schema = tools.find((t) => t.name === toolName)?.inputSchema || {};
  const missing = [];
  for (const key of Object.keys(schema)) {
    if (!(key in args)) missing.push(key);
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required arguments for tool "${toolName}": ${missing.join(", ")}`
    );
  }
}

async function runWorkflow(userPrompt) {
  // 1️⃣ Kết nối MCP Client
  const client = new MCPClient(process.env.MCP_SERVER_WS);
  await client.connect();

  // 2️⃣ Lấy tool metadata
  const tools = await client.fetchMetadata();
  console.log("Tools metadata:", tools);

  // 3️⃣ Tạo system prompt + mô tả tools
  const systemPrompt = `
Bạn là AI trợ lý. Bạn có thể gọi các tool sau:
${JSON.stringify(tools, null, 2)}

⚠️ Khi cần gọi tool, hãy luôn trả đầy đủ tất cả các field bắt buộc trong inputSchema.
Output phải là JSON có key "tool_call":
{
  "name": "<tool_name>",
  "arguments": { ... }
}
`;

  // 4️⃣ Khởi tạo GenAI client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 5️⃣ Bắt đầu chat session với AI
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
    ],
  });

  const response = await chat.sendMessage({ message: userPrompt });
  const aiMessage = response.candidates[0].content.parts
    .map((p) => p.text)
    .join("");
  console.log("AI output:", aiMessage);

  // 6️⃣ Parse JSON tool_call
  let parsed;
  try {
    const cleaned = extractJson(aiMessage);
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.log("AI output không phải JSON, gửi lại cho user:", aiMessage);
    return;
  }

  if (!parsed.tool_call) {
    console.log("Không có tool_call → AI đã trả lời thẳng:", aiMessage);
    return;
  }

  // 7️⃣ Validate tool arguments
  const { name, arguments: args } = parsed.tool_call;
  validateArgs(name, args, tools);
  console.log("Calling tool:", name, args);

  // 8️⃣ Call tool qua MCP Client
  const toolResult = await client.callTool(name, args);
  console.log("Tool result:", toolResult);

  // 9️⃣ Gửi kết quả tool về AI để reasoning tiếp
  const followUp = await chat.sendMessage({
    message: JSON.stringify(toolResult),
    role: "user", // ✅ role hợp lệ
  });

  const final = followUp.candidates[0].content.parts
    .map((p) => p.text)
    .join("");
  console.log("Final AI response:", final);
}

// --- 10️⃣ Chạy workflow ---
const userPrompt =
  "Gửi email thông báo chương trình khuyến mãi cho Khách B (nguyenvanb@gmail.com), nội dung là khuyến mãi sale lớn đợt cuối năm 2025";

runWorkflow(userPrompt).catch(console.error);
