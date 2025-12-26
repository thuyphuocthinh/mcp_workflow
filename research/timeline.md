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
+ Drag - drop vào react flow được
+ Cơ chế truyền config của node được drag vào react flow
+ Custom để type node đồng bộ giữa sidebar và trong react flow
+ Hook flow state, style nodes
+ Delete Node, Context Menu
## Tuần 3
- Custom edge
- Handle connect nodes, insert nodes in the middle
+ Style edge (ConnectionLineType, MakerType, edge styles) (Done)
+ Connect nodes theo chieu ngang (Done)
+ Bấm vào edge thì hiện dấu + thêm node tại đó
+ Remove node o giua thi connect node ke truoc -> node ke sau cua node bi xoa
+ Auto Layout (understand code again)
+ Handle Copy, cut, paste node
+ Undo, redo
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
+ User (first_name, last_name, email, password, created_at, updated_at)
+ Graphs (id, name, description, nodes(JSON), edges(JSON), user_id, created_at, updated_at)
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
## Tuần 6
- Ghép services FE, register, login, get list graphs
- Ghép chạy được LLM stream ở BE (chưa cần agent)
## Tuần 7
- Ghép stream FE
- Ghép MCP client, servers (DOCS, SHEETS)
## Tuần 8
- Viết api trả ra tool
- Tạo trang tool
- Oauth2 google
## Tuần 9, Tuần 10
- Ghép tools, chạy agent
- Tích hợp AI model vào và test workflow
