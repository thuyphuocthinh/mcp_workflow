# MCP Workflow

Hệ thống xây dựng và thực thi workflow AI sử dụng **Model Context Protocol (MCP)**, tích hợp với các LLM providers (OpenAI, Anthropic, Google Gemini) và các dịch vụ Google Workspace.

## 🌟 Tính năng chính

- **AI Agent System** - Hỗ trợ agentic loop với LLM và tool calling
- **Visual Workflow Builder** - Xây dựng workflow qua giao diện kéo thả (React Flow)
- **MCP Integration** - Tích hợp sẵn các MCP servers cho Google services
- **Multi-LLM Support** - OpenAI, Anthropic Claude, Google Gemini
- **OAuth Authentication** - Xác thực và quản lý token tự động refresh

## 🏗️ Kiến trúc hệ thống

```
mcp/
├── backend/          # NestJS API Server
├── frontend/         # React + Vite Client
├── mcp_servers/      # MCP Server Providers
├── demo/             # Demo examples
└── research/         # Research & experiments
```

### Tech Stack

| Component | Technologies |
|-----------|--------------|
| **Backend** | NestJS, MongoDB, LangGraph, Passport JWT |
| **Frontend** | React 19, Vite, Chakra UI, React Flow, TanStack Query |
| **MCP Servers** | TypeScript, @modelcontextprotocol/sdk, Express |
| **AI/LLM** | OpenAI, Anthropic SDK, Google GenAI |

## 📦 MCP Servers

Các MCP server được tích hợp sẵn:

| Server | Mô tả |
|--------|-------|
| `calculator` | Tính toán toán học |
| `google_search` | Tìm kiếm Google |
| `gmail` | Gửi/đọc email Gmail |
| `google_calendar` | Quản lý lịch |
| `google_docs` | Tạo/chỉnh sửa Google Docs |
| `google_drive` | Quản lý files Drive |
| `google_sheets` | Làm việc với Spreadsheets |
| `google_slides` | Tạo presentations |

## 🚀 Cài đặt

### Yêu cầu

- Node.js >= 18
- MongoDB
- Google Cloud Console project (cho OAuth)

### 1. Clone repository

```bash
git clone <repository-url>
cd mcp
```

### 2. Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# MCP Servers
cd ../mcp_servers
npm install
```

### 3. Cấu hình environment

**Backend** (`backend/.env`):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mcp_workflow

# JWT
JWT_SECRET=your-jwt-secret

# LLM API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_GENAI_API_KEY=your-google-genai-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**MCP Servers** (`mcp_servers/.env`):

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Cài đặt root dependencies

```bash
npm install
```

### 5. Chạy ứng dụng

**🚀 Quick Start (một lệnh duy nhất):**

```bash
npm run dev
```

Lệnh này sẽ chạy đồng thời cả 3 services: MCP Servers, Backend, và Frontend.

**Hoặc chạy riêng từng service:**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - MCP Servers
cd mcp_servers
npm run dev
```

## 🔧 Các loại Node trong Workflow

### LLM Node
Gọi LLM với prompt tùy chỉnh, hỗ trợ template variables:
- `{{input}}` - Input từ state
- `{{output}}` - Output trước đó
- `{{context.key}}` - Giá trị từ context

### MCP Tool Node
Gọi một tool cụ thể từ MCP server với arguments được định nghĩa trước.

### Agent Node
Agentic loop tự động với khả năng:
- Sử dụng nhiều tools từ các MCP servers
- Tự động quản lý authentication
- Giới hạn iterations để tránh infinite loop

## 📄 API Documentation

Khi backend đang chạy, truy cập Swagger UI tại:

```
http://localhost:3000/api
```

## 🔐 OAuth Flow

1. User yêu cầu kết nối tool (VD: Gmail)
2. Backend redirect đến Google OAuth
3. User authorize permissions
4. Callback lưu tokens vào database
5. Token tự động refresh khi hết hạn

## 📁 Cấu trúc Backend

```
backend/src/
├── modules/
│   ├── graphs/          # Workflow & Graph management
│   │   ├── registry/    # Node registry (LLM, MCP, Agent)
│   │   ├── services/    # Graph, LLM, MCP client services
│   │   └── types/       # TypeScript types
│   ├── mcp/             # MCP authentication & tokens
│   ├── models/          # AI model configurations
│   └── users/           # User management
└── shared/              # Common utilities & responses
```

## 📁 Cấu trúc Frontend

```
frontend/src/
├── components/          # React components
├── pages/               # Page components
├── services/            # API services
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## 🛠️ Development

### Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

### Testing

```bash
cd backend && npm test
```

### Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# MCP Servers
cd mcp_servers && npm run build
```

## 📝 License

UNLICENSED - Private project

---

**Author**: thuyphuocthinh
