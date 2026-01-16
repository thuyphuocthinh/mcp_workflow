# MCP Server Refactoring - Instructions

## Summary

Refactored MCP server architecture với các cải tiến:
- **Fixed critical bug**: Transport now properly connected to Express routes
- **DRY code**: Created `core/` module with reusable components
- **Modular tools**: Separated each tool into individual files
- **Error handling**: Added `withErrorHandling` wrapper to all tools
- **Type safety**: Removed `any` types, added proper interfaces
- **Dynamic tokens**: Google Docs now accepts `accessToken` as input parameter

---

## Architecture

```
mcp_servers/src/
├── core/                          # Core infrastructure
│   ├── types.ts                   # Common types & interfaces
│   ├── errors.ts                  # Error classes + withErrorHandling
│   ├── createMcpServer.ts         # Factory with fixed transport binding
│   └── index.ts                   # Barrel export
├── providers/
│   ├── calculator/
│   │   ├── tools/
│   │   │   ├── evaluate.ts
│   │   │   ├── evaluateWithVars.ts
│   │   │   └── derivative.ts
│   │   └── index.ts
│   ├── gmail/
│   │   ├── helpers/gmailClient.ts
│   │   ├── tools/
│   │   │   ├── listEmails.ts
│   │   │   ├── readEmail.ts
│   │   │   └── sendEmail.ts
│   │   └── index.ts
│   ├── google_docs/
│   │   ├── helpers/docsClient.ts
│   │   ├── tools/
│   │   │   ├── createDoc.ts
│   │   │   ├── getDoc.ts
│   │   │   ├── appendText.ts
│   │   │   └── replaceText.ts
│   │   └── index.ts
│   ├── google_search/
│   │   ├── tools/search.ts
│   │   ├── resources/topSearchResults.ts
│   │   ├── prompts/summarizeQuery.ts
│   │   └── index.ts
│   └── google_sheets/
│       ├── helpers/sheetsStorage.ts
│       ├── tools/
│       │   ├── createSheet.ts
│       │   ├── getSheet.ts
│       │   ├── appendRow.ts
│       │   └── listSheets.ts
│       └── index.ts
└── index.ts                       # Entry point
```

---

## Run Servers

```powershell
cd e:\Career\Software_Engineer\Projects\mcp\mcp_servers
npm run dev
```

---

## Test MCP Endpoints (PowerShell)

### Health Check
```powershell
curl.exe http://localhost:3001/health
```

### List Tools
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools/list"
    id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/mcp" -Method POST -ContentType "application/json" -Headers @{"Accept"="application/json, text/event-stream"} -Body $body
```

### Call Calculator Evaluate
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools/call"
    id = 2
    params = @{
        name = "evaluate"
        arguments = @{
            expression = "2+3*4"
        }
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3001/mcp" -Method POST -ContentType "application/json" -Headers @{"Accept"="application/json, text/event-stream"} -Body $body
```

---

## Add New Provider

1. Create folder: `providers/new_provider/`
2. Create tools in `tools/` subfolder
3. Create `index.ts`:

```typescript
import { createMcpServer } from "../../core/index.js";
import { registerToolA } from "./tools/index.js";

const { server, start } = createMcpServer({
  name: "new-provider",
  version: "1.0.0",
  port: Number(process.env.MCP_NEW_PROVIDER_PORT) || 3006,
});

registerToolA(server);
export const main = start;
```

4. Add to `providers/index.ts`

---

## Key Files

| File | Purpose |
|------|---------|
| `core/types.ts` | Common interfaces: `ToolResponse`, `Sheet`, `GoogleDoc` |
| `core/errors.ts` | Error classes + `withErrorHandling()` wrapper |
| `core/createMcpServer.ts` | Factory with transport-express binding |