Dưới đây là **bản tổng hợp đầy đủ + bổ sung** nội dung bạn cần research để build UI workflow MCP với React Flow/XYFlow — ở **dạng file Markdown**.

---

# 📘 React Flow / XYFlow – MCP Workflow Research Checklist

## 1. Node & Edge Structure

### **Node**

Một node trong React Flow có các field quan trọng:

* `id`: unique key
* `position: { x, y }`: vị trí node
* `data`: dữ liệu gắn với node (ví dụ: AI model, tool config)
* `type`: loại node (`default`, `input`, `output`, `group`, custom…)
* `sourcePosition`, `targetPosition`: vị trí handle (`left`, `right`, `top`, `bottom`)
* `hidden?`: ẩn/hiện node
* `selected?`: node đang được focus hoặc drag
* `style`: custom CSS
* `deletable`, `draggable`, `selectable`: giới hạn behavior
* `parentNode`, `extent`: dùng cho hierarchical/contained nodes

### **Default Node Types**

* `default`
* `input`
* `output`
* `group`

### **Edge**

* Kết nối hai node qua `source` và `target`
* Có các coordinates:

  * `sourceX`, `sourceY`
  * `targetX`, `targetY`
* Có thể custom:

  * path
  * marker (arrow)
  * animation
  * label

### **Custom Edge**

* Tự tạo component để render edge
* Sử dụng API:

  * `BaseEdge`
  * `BezierEdge`
  * `SmoothStepEdge`
  * `StraightEdge`
  * `getBezierPath`
  * `getStraightPath`
* Sử dụng **SVG path editor** để tinh chỉnh hình dạng edge:
  [https://yqnn.github.io/svg-path-editor/](https://yqnn.github.io/svg-path-editor/)

---

## 2. Custom Node

📎 Docs: [https://reactflow.dev/learn/customization/custom-nodes](https://reactflow.dev/learn/customization/custom-nodes)

Research những phần sau:

* Cách khai báo `nodeTypes`
* Cách render UI node bằng React component
* Sử dụng `Handle` để tạo input/output connector
* Styling node UI (background, shadow…)
* Interaction bên trong node:

  * button
  * dropdown
  * icon
  * tooltip
* Node preview component (kéo thả từ sidebar vào canvas)
* Node resizing (nếu cần)
* Node showing AI model status / tool selected
* Node detail config panel (nằm ngoài flow canvas)

---

## 3. Edge Handling

📎 Docs: [https://reactflow.dev/learn/customization/custom-edges](https://reactflow.dev/learn/customization/custom-edges)
📎 Labels: [https://reactflow.dev/learn/customization/edge-labels](https://reactflow.dev/learn/customization/edge-labels)

Các mục cần research:

* Add/delete edges với `onConnect` và `onEdgesChange`
* Validate connection (vd: chỉ cho nối input → tool → output)
* Custom edge path (straight, step, smooth, bezier)
* Arrow markers
* Animated edges (workflow đang chạy)
* Custom label
* Hover/click để hiện config edge
* Show rule errors bằng màu edge (đỏ khi invalid)

---

## 4. Drag / Drop & Persistence

### Drag features

📎 Example: [https://reactflow.dev/examples/nodes/drag-handle](https://reactflow.dev/examples/nodes/drag-handle)

Research:

* Drag node
* Limit drag region (drag handle)
* Lock node (`draggable: false`)
* Auto-pan when dragging

### Persistence

* Lưu vị trí node (localStorage hoặc DB)
* Export/import flow JSON
* Sử dụng:

  * `onNodeDragStop`
  * `onNodesChange`
  * `onEdgesChange`

### Utils

* `fitView`
* Zoom, pan
* Smooth transition

---

## 5. Node CRUD (Create / Delete / Clone)

**Lưu ý:** Clone/Copy/Paste là PRO FEATURE
→ Tạm thời research sau.

Nhưng bạn cần nghiên cứu các hook/core API:

* `addNodes`
* `addEdges`
* `setNodes`
* `setEdges`
* Multi-select:

  * giữ Shift
  * bounding box selection

---

## 6. Workflow Utilities

### Components bạn nên dùng:

| Component      | Tác dụng                  |
| -------------- | ------------------------- |
| `MiniMap`      | Preview tổng thể workflow |
| `Controls`     | Buttons zoom, fitView     |
| `Background`   | Grid hoặc dots background |
| `Panel`        | Custom UI overlay         |
| `useReactFlow` | Điều khiển flow           |
| `NodeToolbar`  | Toolbar trên từng node    |

---

## 7. Node Interaction Layer (MCP-specific)

Vì bạn đang build workflow MCP:

### Mỗi node sẽ cần:

* Icon biểu tượng model/tool
* Tên model
* Mô tả tool
* Button:

  * Edit
  * Remove
  * Add new connection
  * Test model/tool
* Loading state (khi chạy)
* Status indicator:

  * success
  * failed
  * running
  * idle

### Node config panel

Bên phải màn hình (drawer/panel):

* Chọn model
* Chọn tools
* Config parameters
* Lưu config của node

---

## 8. Future Research (nếu muốn build workflow editor hoàn chỉnh)

* Undo/Redo hệ thống
* Multi-user collaboration (yjs)
* Snap-to-grid
* Auto layout graph
* Minimap custom style
* Custom connection rules logic
* Workflow execution visualization (animate path)

