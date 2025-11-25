const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

class MCPClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.on("open", () => resolve());
      this.ws.on("message", (msg) => this._onMessage(msg));
      this.ws.on("error", reject);
    });
  }

  _onMessage(msg) {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (data.id && (data.result || data.error)) {
      const p = this.pending.get(data.id);
      if (p) {
        this.pending.delete(data.id);
        if (data.error) p.reject(data.error);
        else p.resolve(data.result);
      }
    }
  }

  _sendRpc(method, params) {
    const id = uuidv4();
    const payload = { jsonrpc: "2.0", id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  async fetchMetadata() {
    const res = await this._sendRpc("get_tools", {});
    return res.tools;
  }

  async callTool(name, args) {
    const res = await this._sendRpc("call_tool", { name, arguments: args });
    return res.result;
  }
}

module.exports = MCPClient;
