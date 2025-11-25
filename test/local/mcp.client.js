const axios = require("axios");

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.tools = {};
  }

  async fetchMetadata() {
    const res = await axios.get(`${this.serverUrl}/metadata`);
    this.tools = res.data.tools;
    return this.tools;
  }

  // Gọi tool từ AI
  async callTool(name, args) {
    const res = await axios.post(`${this.serverUrl}/callTool`, {
      name,
      arguments: args,
    });
    return res.data;
  }
}

module.exports = MCPClient;
