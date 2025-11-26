Dưới đây là một bản **Markdown đầy đủ** về lý thuyết MCP, MCP Server và MCP Client mà bạn có thể lưu vào file `MCP.md`. Tôi trình bày cả lý thuyết, cấu trúc, cách hoạt động, và các ví dụ minh họa:

````markdown
# MCP (Modular Control Protocol) - Tổng quan

## 1. Giới thiệu

**MCP (Modular Control Protocol)** là một **giao thức (protocol)** định nghĩa cách các ứng dụng, AI model và các "tool" (module) tương tác với nhau trong một workflow.  

- MCP **không phải là một sản phẩm** cụ thể, mà là **một specification** (quy chuẩn) về cách trao đổi dữ liệu, metadata, và cách gọi các công cụ.  
- MCP có thể chạy trên nhiều layer transport khác nhau: HTTP, WebSocket, TCP, v.v.  
- MCP giúp AI model hoặc các hệ thống orchestration **biết được tool nào có sẵn**, cách gọi tool đó, và nhận kết quả trả về.

---

## 2. MCP Specification (Giao thức)

### 2.1. Khái niệm chính
- **Tool**: Một module chức năng (ví dụ: `sheets.appendRows`, `docs.generate`, `mail.send`).  
- **Tool metadata**: Thông tin về tool, bao gồm:
  - Tên tool (`name`) 
  - Mô tả (`description`) 
  - Input schema (dạng dữ liệu mà tool nhận) 
  - Output schema (dạng dữ liệu mà tool trả về)
  - MCP = application protocol, xây dựng trên transport layer (WebSocket, TCP, HTTP). Nó giống cách HTTP là protocol application layer chạy trên TCP. MCP cũng vậy, nhưng dành cho AI + tool orchestration.

- **Tool call**: Khi AI hoặc client muốn dùng tool, nó gửi request với:
  ```json
  {
    "method": "call_tool",
    "params": {
      "name": "<tool_name>",
      "arguments": { ... }
    }
  }
````

* **Response**: MCP server trả về kết quả hoặc lỗi:

  ```json
  {
    "jsonrpc": "2.0",
    "id": "<request_id>",
    "result": { ... } 
  }
  ```

  hoặc

  ```json
  {
    "jsonrpc": "2.0",
    "id": "<request_id>",
    "error": { "code": -32000, "message": "Error description" }
  }
  ```

---

### 2.2. Các phương thức cơ bản

| Method         | Mục đích                     | Request params      | Response                       |
| -------------- | ---------------------------- | ------------------- | ------------------------------ |
| `get_tools`    | Lấy danh sách tool có sẵn    | Không cần params    | `tools: [{name, description}]` |
| `call_tool`    | Gọi một tool                 | `name`, `arguments` | `result: {...}`                |
| `server_ready` | Thông báo server đã sẵn sàng | Không               | `message`                      |

---

## 3. MCP Server

MCP Server là **ứng dụng triển khai specification MCP**, chịu trách nhiệm:

1. **Cung cấp metadata tools**: Ai client có thể query `get_tools`.
2. **Xử lý tool call**: Nhận request `call_tool`, gọi logic của tool, trả về kết quả.
3. **Tuân thủ JSON-RPC hoặc bất kỳ chuẩn giao tiếp nào đã chọn**.

### 3.1. Cấu trúc MCP Server

```
MCP Server
├─ Tools
│  ├─ sheets.appendRows
│  ├─ docs.generate
│  └─ mail.send
├─ WebSocket / HTTP listener
├─ JSON-RPC handler
└─ Error handler
```

### 3.2. Ví dụ tối giản (Node.js + WebSocket)

```js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });

const tools = {
  "docs.generate": {
    description: "Generate a doc",
    implementation: async ({ title, content }) => ({
      docId: "DOC_" + Math.random().toString(36).slice(2, 8),
      url: "http://localhost:3001/docs/fake.pdf",
      content: `Report for ${title}`,
    }),
  },
};

wss.on("connection", (ws) => {
  ws.on("message", async (msg) => {
    const { id, method, params } = JSON.parse(msg);

    if (method === "get_tools") {
      const meta = Object.keys(tools).map((name) => ({
        name,
        description: tools[name].description,
      }));
      ws.send(JSON.stringify({ jsonrpc: "2.0", id, result: { tools: meta } }));
    }

    if (method === "call_tool") {
      const { name, arguments: args } = params;
      const tool = tools[name];
      const result = await tool.implementation(args);
      ws.send(JSON.stringify({ jsonrpc: "2.0", id, result }));
    }
  });

  ws.send(JSON.stringify({ jsonrpc: "2.0", method: "server_ready", params: { message: "ready" } }));
});
```

---

## 4. MCP Client

MCP Client là **đầu mối giao tiếp của AI hoặc các workflow node** với MCP server.

### 4.1. Nhiệm vụ

1. **Kết nối server** (WebSocket/HTTP).
2. **Lấy metadata tool** (`get_tools`) để biết AI có thể dùng tool nào.
3. **Gửi tool call** khi AI muốn dùng tool.
4. **Nhận kết quả** và trả về cho AI để reasoning tiếp.

### 4.2. Ví dụ Node.js

```js
const WebSocket = require("ws");

class MCPClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.requests = new Map();
    this.idCounter = 1;

    this.ws.on("message", (msg) => {
      const data = JSON.parse(msg);
      if (data.id && this.requests.has(data.id)) {
        this.requests.get(data.id)(data.result);
        this.requests.delete(data.id);
      }
    });
  }

  fetchMetadata() {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.requests.set(id, (result) => resolve(result.tools));
      this.ws.send(JSON.stringify({ jsonrpc: "2.0", id, method: "get_tools" }));
    });
  }

  callTool(name, args) {
    return new Promise((resolve) => {
      const id = this.idCounter++;
      this.requests.set(id, (result) => resolve(result));
      this.ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id,
        method: "call_tool",
        params: { name, arguments: args },
      }));
    });
  }
}

module.exports = MCPClient;
```

---

## 5. MCP trong workflow với AI

1. **User gửi prompt** → MCP Client nhận.
2. **Client lấy tool metadata** → truyền cho AI (system prompt).
3. **AI reasoning** → quyết định gọi tool nào.
4. **Client gửi tool call tới MCP Server** → nhận kết quả.
5. **AI tiếp tục reasoning** với kết quả tool → trả final response cho user.

> MCP đảm bảo rằng AI **không cần biết chi tiết tool implementation**, chỉ cần tuân theo specification để gọi tool.

---

## 6. Lưu ý

* MCP là **specification**, không phải code cố định. Server và client phải implement spec.
* Có thể triển khai trên nhiều transport: HTTP, WebSocket, gRPC, TCP…
* Nếu AI hoặc client **không tuân theo MCP spec**, server sẽ không hiểu request → tool call thất bại.
* MCP cung cấp **tính module hóa**, dễ mở rộng và tích hợp AI vào workflow.

---

## 7. Tổng kết

* **MCP** = giao thức/specification giúp AI và các module tương tác.
* **MCP Server** = triển khai spec, cung cấp tool, xử lý tool call.
* **MCP Client** = giao tiếp server → cho AI gọi tool → nhận kết quả.
* MCP cho phép **AI reasoning + tool execution** trong workflow một cách chuẩn hóa.

```

---

Nếu bạn muốn, tôi có thể tạo **bản diagram kèm flow AI → MCP Client → MCP Server → Tool → AI** trong cùng file markdown để dễ hình dung hơn.  

Bạn có muốn tôi thêm diagram này luôn không?
```

-------------------
Dưới đây là **tóm tắt toàn bộ specification của MCP** theo đúng bản chất kỹ thuật, ngắn – dễ hiểu – đủ ý.
Đây là bản tóm tắt chuẩn để bạn nắm hết MCP trong 5 phút.

---

# 🧠 **1. Transport Layer (Cách gửi/nhận dữ liệu)**

MCP không bắt buộc dùng WebSocket hay HTTP.
Only yêu cầu:

* Giao tiếp theo kiểu **JSON-RPC inspired**, message-based
* Gửi/nhận thông qua **stdin/stdout**, WebSocket hoặc custom stream
* Mỗi message là **JSON object**

---

# 🧩 **2. Message Format (Định dạng message)**

Có 4 nhóm message chính:

## ✔ 2.1 Client → Server

* `initialize` (handshake, version)
* `tools/list`
* `tools/call`
* `resources/list`
* `resources/read`
* `prompts/list`
* `prompts/call`

## ✔ 2.2 Server → Client

* `result`
* `error`
* `resource-chunk` (stream)
* `tool-output`
* `event`
* `progress`

Mỗi message đều có:

* `type`
* `id`
* body tùy loại

---

# 🛠 **3. Tools (API được expose bởi server)**

Tool = hành động mà mô hình có thể gọi.

Mỗi tool có:

* `name`
* `description`
* `inputSchema` (JSON Schema)
* `outputSchema` (tùy chọn)

Client gọi tool bằng message:

```
{ "type": "tools/call", "tool": "search", "args": {...} }
```

Server trả về:

```
{ "type": "tool-output", "content": ... }
```

---

# 📦 **4. Resources (Dữ liệu dưới dạng "file ảo"")**

MCP định nghĩa cách client đọc tài nguyên mà server expose:

Resource có:

* `uri`
* `name`
* `mimeType`
* permissions

Client yêu cầu:

```
{ "type": "resources/read", "uri": "notes/123" }
```

Server stream từng chunk:

```
{ "type": "resource-chunk", "chunk": "...", "done": false }
```

---

# 🧠 **5. Prompts (Prompt templates server cung cấp)**

Server có thể gửi preset prompts, ví dụ:

* "createSQLQuery"
* "summarizeNote"
* "analyzeLog"

Client gọi:

```
{ "type": "prompts/call", "name": "summarize", "args": {...} }
```

---

# 🌐 **6. Server Capabilities**

MCP server công bố mình hỗ trợ gì:

* tools
* resources
* prompts
* events
* streaming
* version

Thông qua message `initialize`.

---

# 🔄 **7. Versioning Specification**

Server và client negotiate version theo:

* `protocolVersion`
* `capabilities`

Nếu không khớp → từ chối connect.

---

# 🔒 **8. Security / Permissions**

Spec xác định:

* tool phải mô tả rõ permissions
* resource phải có read/write rules
* client chỉ được gọi tool đã advertise
* tránh việc AI chạy lệnh không kiểm soát

⚠ MCP **không** định nghĩa sandbox implementation, chỉ mô tả metadata.

---

# 🔀 **9. Events (Server → Client)**

Server có thể chủ động gửi:

* update events
* file change
* workflow status
* notifications

Ví dụ:

```
{ "type": "event", "event": "workflowFinished" }
```

---

# 📡 **10. Streaming Specification**

Hỗ trợ stream:

* tool output
* resource content
* logs/progress

Các frame:

* `progress`
* `resource-chunk`
* `tool-output`

---

# 🏗 **11. Multi-Server / Multiple Provider**

Client có thể connect nhiều MCP server.
Spec định nghĩa:

* server identity
* namespace
* tránh tool name conflict

---

# 🔍 **12. Tool Discovery**

Khách hàng hỏi server:

```
{ "type": "tools/list" }
```

Server trả lại schema đầy đủ.

AI có thể “hiểu” tools mà không lập trình trước.

---

# 🧭 **13. Error Format**

Errors có dạng:

```
{
  "type": "error",
  "id": "...",
  "error": {
     "code": 400,
     "message": "Invalid input",
     "data": {...}
  }
}
```

---

# 📝 **14. Lifecycle / Initialization**

1. Client → `initialize`
2. Server → capabilities
3. Client → list tools, resources
4. AI bắt đầu dùng MCP

---

# ⭐ **Tóm tắt siêu ngắn 1 câu**

> **MCP định nghĩa cách AI và backend giao tiếp qua JSON message: listing tools/resources, calling tools, streaming output, versioning và events — tất cả đều là specification, không phải implement.**

---

Nếu bạn muốn, mình có thể:

* Vẽ lại **MCP architecture diagram**
* So sánh MCP vs plugin vs Actions
* Viết bản tóm tắt theo kiểu **để bạn note vào tài liệu dự án**

Muốn kiểu nào?
