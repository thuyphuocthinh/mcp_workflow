Mục tiêu

- Xây dựng kéo thả workflow với các edges, nodes, thao tác clone, delete được, nhập cấu hình từng nodes
- Xác thực oauth
- Hiểu sâu mcp client, server, code được mcp client cơ bản
- Chạy nền workflow xử lý ở BE, tích hợp model AI vào

## Tuần 1

- Tạo được giao diện kéo thả các edges, nodes
- Note lý thuyết, kiến trúc MCP
- Research react-flow, edge, nodes

## Tuần 2

- Sidebar
- Custom node, label, ...

* Drag - drop vào react flow được
* Cơ chế truyền config của node được drag vào react flow
* Custom để type node đồng bộ giữa sidebar và trong react flow
* Hook flow state, style nodes
* Delete Node, Context Menu

## Tuần 3

- Custom edge
- Handle connect nodes, insert nodes in the middle

* Style edge (ConnectionLineType, MakerType, edge styles) (Done)
* Connect nodes theo chieu ngang (Done)
* Bấm vào edge thì hiện dấu + thêm node tại đó
* Remove node o giua thi connect node ke truoc -> node ke sau cua node bi xoa
* Auto Layout (understand code again)
* Handle Copy, cut, paste node
* Undo, redo

## Tuần 4

- 15/12 => Thêm tool (Fake JSON)
- 17/12 Giao diện debug, chat response
- 19/12, 20/12 => panel config
  => Base Node Properties
  => LLM | Agent Node extends Base Node
  => Get Node Properties By Type => render to panels
  => How to manage states => SINGLE SOURCE OF TRUTH

## Tuần 5

- 22/12, 24/12/ 26/12 Handle saved, unsaved, save graph FE side, render data => UI graph (Thinh)
- Init Backend (Database, Structure, Auth Email, Password)
- BE lưu graph, tối ưu graph

* User (first_name, last_name, email, password, created_at, updated_at)
* Graphs (id, name, description, nodes(JSON), edges(JSON), user_id, created_at, updated_at)
  FE send request CREATE graph {
  name,
  description
  }
  => CREATE DEFAULT GRAPH
  FE send request SAVE graph {
  name,
  description,
  config: {
  nodes: [
  {
  id,
  type,
  position,
  data: {
  label,
  userPrompt,
  tools?,
  variables?
  }
  }
  ],
  edges: [
  {
  id,
  source,
  target,
  soureHandle,
  targetHandle
  }
  ]
  }
  }
  => VALIDATE GRAPH => SAVE
  FE send request run workflow
  => VALIDATE GRAPH DÙNG TOPO SORT

- Research langchain/langraph/ReAct agent flow =>
  Planner
  ↓
  Executor → Tool
  ↺ (retry / reflect)
  ↓
  Evaluator → route → Executor / End
  => STREAMING
- Thứ 7
  => Code demo langraph hoặc dùng thư viện ...

```
        ┌────────────┐
        │   START    │
        └─────┬──────┘
              ↓
        ┌────────────┐
        │   LLM      │
        │ (generate) │
        └─────┬──────┘
              ↓
        ┌────────────┐
        │  CHECK     │
        │ ok ?       │
        └───┬───┬────┘
            │   │
           yes  no
            │   │
            ↓   └───────────┐
         ┌───────┐          │
         │  END  │◄─────────┘
         └───────┘
```

```
type State = {
  input: string
  output?: string
  ok?: boolean
}

const llmNode = async (state: State) => {
  const output = await llm.stream(state.input) // stream
  return { output }
}

const checkNode = async (state: State) => {
  const ok = state.output && state.output.length > 20
  return { ok }
}

const graph = new StateGraph<State>()
  .addNode("llm", llmNode)
  .addNode("check", checkNode)

graph.addEdge("START", "llm")
graph.addEdge("llm", "check")

graph.addConditionalEdges(
  "check",
  (state) => state.ok ? "END" : "llm"
)

const app = graph.compile()

@Post("/chat")
async chat(@Body() dto, @Res() res) {
  const stream = await app.stream({
    input: dto.message
  })

  for await (const chunk of stream) {
    res.write(chunk.output ?? "")
  }

  res.end()
}
[text](https://chatgpt.com/g/g-p-69208a0d14d88191aa8ede10ba87375d-mcp-workflow/c/694e9c63-4380-8323-aca9-86fc2c5c2a7b)
```

## Tuần 6

- Tìm hiểu lại streaming, flow đã viết langraph tham khảo từ gpt
- Ghép services FE, register, login, get list graphs
- Ghép chạy được LLM stream ở BE (chưa cần agent) => chuẩn hóa lại data trả về từ streaming
- Ghép stream FE

## Tuần 7

- Ghép MCP client, servers (DOCS, SEARCH)
  https://www.youtube.com/watch?v=RhTiAOGwbYE
  https://www.youtube.com/watch?v=ZoZxQwp1PiM
- Viết api trả ra tool

* model tool (fake JSON or db ?)

- Ghép api tool, click tool => drawer chi tiet tool

## Tuần 8

- Thêm nhập api key model gemini để user nhập vào dùng workflow
- Thêm Oauth cho tool cần oauth
- Ghép Oauth FE
- Thêm mcp google driver, google calendar, google slide
- Chọn tool, user prompt ở node agent

## Tuần 9

- Tích hợp AI model vào và test workflow, kỹ langraph & mcp inspector

* Đã call mcp calculator được nhưng bị loop max_iteration (checked)
* Call mcp cần auth thì chưa truyền access token cho model (checked)
  => T2: Research kĩ lại langraph
  => T4: Fix các vấn đề trên
* call google search chưa được (checked => billing account => flow oke)
* 1 node nhiều > 1 tool
  => T6,
* kêu gửi link chỉ gửi id => chưa đúng yêu cầu

- T7

* Check flow nhiều node

## Tuần 10

- Viết test cho cả FE và BE, add eslint, commitlint config
- Review CI-CD và viết CI-CD triển khai

## Tuần 11

- Fix bugs tối ưu UI, refactor UI
