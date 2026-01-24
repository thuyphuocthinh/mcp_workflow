require("dotenv").config();

const { OpenAI } = require("openai");
const MCPClient = require("./mcp.client.js");

async function runWorkflow(userPrompt) {
  const client = new MCPClient("http://localhost:3000");
  const tools = await client.fetchMetadata();

  console.log("tools: ", tools);

  const systemPrompt = `Bạn có các tool sau: ${JSON.stringify(tools)}`;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  console.log(response.choices[0].message.content);
}

runWorkflow("Tạo báo cáo bán hàng tuần cho Khách A");
