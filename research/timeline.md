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
## Tuần 4, 5
- Handle Panel config, thêm tool (Fake JSON)
- Handle saved, unsaved, save graph FE side, render data => UI graph (Thinh)
- Giao diện debug, chat response
## Tuần 6, 7
- Init Backend (Database, Structure, Auth Email, password, google)
- BE lưu graph, tối ưu graph
- Viết api trả ra tool
## Tuần 8
- Ghép MCP client, servers (DOCS, SHEETS)
- Tạo trang tool
## Tuần 9
- Oauth2 google
- Thêm MCP Mail, Search
## Tuần 10
- Tích hợp AI model vào và test workflow
- Test, tối ưu performance