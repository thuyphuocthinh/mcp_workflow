# LangGraph - Hướng dẫn toàn diện

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt](#cài-đặt)
3. [Kiến trúc cốt lõi](#kiến-trúc-cốt-lõi)
4. [State - Quản lý trạng thái](#state---quản-lý-trạng-thái)
5. [Nodes - Các nút xử lý](#nodes---các-nút-xử-lý)
6. [Edges - Các cạnh kết nối](#edges---các-cạnh-kết-nối)
7. [StateGraph API](#stategraph-api)
8. [Checkpointing & Memory](#checkpointing--memory)
9. [Human-in-the-Loop](#human-in-the-loop)
10. [So sánh LangChain vs LangGraph](#so-sánh-langchain-vs-langgraph)
11. [Ví dụ thực tế trong dự án](#ví-dụ-thực-tế-trong-dự-án)
12. [Best Practices](#best-practices)

---

## Giới thiệu

**LangGraph** là một thư viện mạnh mẽ để xây dựng các ứng dụng AI stateful, multi-actor sử dụng cấu trúc đồ thị (graph-based). LangGraph được phát triển bởi LangChain và cung cấp framework linh hoạt cho các workflow phức tạp và thích ứng.

### Tại sao sử dụng LangGraph?

- **Graph-based Workflows**: Mô hình hóa workflow như đồ thị với nodes và edges
- **Cyclic Workflows**: Hỗ trợ vòng lặp, cho phép agents đánh giá lại và đưa ra quyết định động
- **State Management**: Quản lý trạng thái chia sẻ, bền vững xuyên suốt quá trình thực thi
- **Production-Ready**: Streaming, human-in-the-loop, durable execution

### Core Benefits

| Tính năng | Mô tả |
|-----------|-------|
| **Durable Execution** | Agents có thể persist qua failures và chạy lâu dài |
| **Human-in-the-Loop** | Cho phép con người giám sát và can thiệp |
| **Comprehensive Memory** | Bộ nhớ ngắn hạn và dài hạn |
| **Debugging** | Tích hợp với LangSmith để trace và debug |

---

## Cài đặt

### Python

```bash
pip install -U langgraph
```

### JavaScript/TypeScript (dùng trong dự án này)

```bash
npm install @langchain/langgraph
# hoặc
yarn add @langchain/langgraph
```

---

## Kiến trúc cốt lõi

LangGraph hoạt động dựa trên ba thành phần chính:

```
┌─────────────────────────────────────────────────────────────┐
│                        LangGraph                             │
│                                                              │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│   │  State  │────▶│  Nodes  │────▶│  Edges  │              │
│   │         │     │         │     │         │              │
│   │ Shared  │     │ Process │     │ Control │              │
│   │ Data    │     │ Logic   │     │ Flow    │              │
│   └─────────┘     └─────────┘     └─────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## State - Quản lý trạng thái

State là cấu trúc dữ liệu chia sẻ chứa snapshot hiện tại của ứng dụng. Các nodes có thể đọc và ghi vào state này.

### Định nghĩa State với Annotation (TypeScript)

```typescript
import { Annotation } from '@langchain/langgraph';

// Định nghĩa State Schema
export const State = Annotation.Root({
  // Input từ user
  input: Annotation<string>({
    reducer: (prev, next) => next ?? prev ?? '',
    default: () => '',
  }),

  // Output từ các nodes
  output: Annotation<string | undefined>({
    reducer: (_, next) => next,
  }),

  // Lịch sử messages - sử dụng reducer để append
  messages: Annotation<Message[]>({
    reducer: (prev = [], next = []) => [...prev, ...next],
    default: () => [],
  }),

  // Context chia sẻ giữa các nodes
  context: Annotation<Record<string, any>>({
    reducer: (prev = {}, next = {}) => ({ ...prev, ...next }),
    default: () => ({}),
  }),

  // Tracking errors
  error: Annotation<string | undefined>({
    reducer: (_, next) => next,
  }),
});

// Export type cho TypeScript
export type StateType = typeof State.State;
```

### Reducers

Reducers xác định cách state được cập nhật khi có giá trị mới:

| Reducer Pattern | Mô tả | Ví dụ |
|-----------------|-------|-------|
| **Replace** | Thay thế giá trị cũ | `(_, next) => next` |
| **Merge** | Gộp objects | `(prev, next) => ({...prev, ...next})` |
| **Append** | Thêm vào mảng | `(prev, next) => [...prev, ...next]` |
| **Accumulate** | Cộng dồn | `(prev, next) => prev + next` |

---

## Nodes - Các nút xử lý

Nodes là building blocks của graph. Mỗi node là một function nhận state và trả về state cập nhật.

### Cấu trúc Node

```typescript
// Node đơn giản
const myNode = async (state: StateType): Promise<Partial<StateType>> => {
  // Đọc từ state
  const input = state.input;
  
  // Xử lý logic
  const result = await processData(input);
  
  // Trả về updates cho state
  return {
    output: result,
    messages: [{ role: 'assistant', content: result }],
  };
};
```

### Special Nodes

```typescript
import { START, END } from '@langchain/langgraph';

// START - Entry point của graph
// END - Exit point của graph
```

### Thêm Nodes vào Graph

```typescript
const graph = new StateGraph(State);

// Thêm node với tên
graph.addNode('process_input', processInputNode);
graph.addNode('generate_response', generateResponseNode);
graph.addNode('validate_output', validateOutputNode);
```

---

## Edges - Các cạnh kết nối

Edges định nghĩa luồng thực thi giữa các nodes.

### Normal Edges

```typescript
// Kết nối tuần tự
graph.addEdge(START, 'process_input');
graph.addEdge('process_input', 'generate_response');
graph.addEdge('generate_response', END);
```

### Conditional Edges

```typescript
// Phân nhánh dựa trên điều kiện
graph.addConditionalEdges(
  'validate_output',
  (state: StateType) => {
    if (state.error) {
      return 'retry';  // Quay lại nếu có lỗi
    }
    return 'complete'; // Đi tới kết thúc
  },
  {
    retry: 'generate_response',
    complete: END,
  }
);
```

### Biểu đồ luồng ví dụ

```
          ┌─────────┐
          │  START  │
          └────┬────┘
               │
               ▼
        ┌──────────────┐
        │ process_input│
        └──────┬───────┘
               │
               ▼
      ┌────────────────────┐
      │ generate_response  │◀────────┐
      └────────┬───────────┘         │
               │                     │
               ▼                     │
      ┌────────────────────┐         │
      │  validate_output   │─────────┘
      └────────┬───────────┘  (retry if error)
               │
               ▼ (success)
          ┌─────────┐
          │   END   │
          └─────────┘
```

---

## StateGraph API

StateGraph là class chính để xây dựng và quản lý workflow.

### Lifecycle cơ bản

```typescript
import { StateGraph, START, END } from '@langchain/langgraph';

// 1. Tạo graph với State schema
const graph = new StateGraph(State);

// 2. Thêm nodes
graph.addNode('node1', node1Handler);
graph.addNode('node2', node2Handler);

// 3. Thêm edges
graph.addEdge(START, 'node1');
graph.addEdge('node1', 'node2');
graph.addEdge('node2', END);

// 4. Compile graph
const app = graph.compile();

// 5. Invoke graph
const result = await app.invoke({
  input: 'Hello, World!',
  messages: [],
  context: {},
});
```

### Streaming

```typescript
// Stream events từ graph
const stream = await app.stream({
  input: 'Hello, World!',
  messages: [],
  context: {},
});

for await (const event of stream) {
  console.log('Event:', event);
  // Mỗi event chứa output từ một node
}
```

---

## Checkpointing & Memory

### Loại Memory

| Loại | Phạm vi | Mô tả |
|------|---------|-------|
| **Short-term** | Thread-scoped | Lịch sử conversation trong session |
| **Long-term** | Cross-session | Thông tin user lưu trữ lâu dài |

### Checkpointers

```typescript
import { MemorySaver } from '@langchain/langgraph';

// In-memory (development)
const checkpointer = new MemorySaver();

// Compile với checkpointer
const app = graph.compile({
  checkpointer,
});

// Invoke với thread_id để tracking
await app.invoke(
  { input: 'Hello' },
  { configurable: { thread_id: 'conversation-123' } }
);
```

### Persistence Options

| Checkpointer | Use Case |
|--------------|----------|
| `MemorySaver` | Development, testing |
| `SqliteSaver` | Local development |
| `PostgresSaver` | Production |
| `RedisSaver` | High-performance, caching |

---

## Human-in-the-Loop

LangGraph cho phép tạm dừng và chờ input từ con người.

### Interrupt Pattern

```typescript
import { interrupt } from '@langchain/langgraph';

const humanApprovalNode = async (state: StateType) => {
  // Tạm dừng để chờ approval
  const approval = await interrupt({
    message: 'Bạn có muốn tiếp tục với action này?',
    action: state.pendingAction,
  });
  
  if (approval.approved) {
    return { proceed: true };
  }
  return { error: 'User rejected action' };
};
```

### Use Cases

- **Review & Approval**: Kiểm duyệt actions nhạy cảm
- **Missing Information**: Yêu cầu thêm thông tin từ user
- **Error Correction**: Cho phép user sửa lỗi của AI

---

## So sánh LangChain vs LangGraph

| Aspect | LangChain | LangGraph |
|--------|-----------|-----------|
| **Architecture** | Linear chains (DAG) | Graph-based với cycles |
| **State** | Limited | Explicit, persistent state |
| **Complexity** | Simple workflows | Complex, multi-agent |
| **Loops** | ❌ No cycles | ✅ Supports cycles |
| **Conditional Logic** | Basic | Advanced branching |
| **Best For** | RAG, simple chatbots | Autonomous agents, complex workflows |

### Khi nào dùng gì?

**Chọn LangChain khi:**
- Workflow linear, đơn giản
- RAG systems
- Quick prototyping
- Basic chatbots

**Chọn LangGraph khi:**
- Multi-agent systems
- Cần state management
- Dynamic, conditional logic
- Production-grade agents

---

## Ví dụ thực tế trong dự án

Dự án này sử dụng LangGraph trong `workflow.service.ts`:

### State Definition

```typescript
// File: src/modules/graphs/services/workflow.service.ts

export const State = Annotation.Root({
  input: Annotation<string>({
    reducer: (prev, next) => next ?? prev ?? FALLBACK_PROMPT,
    default: () => FALLBACK_PROMPT,
  }),
  
  output: Annotation<string | undefined>({
    reducer: (_, next) => next,
  }),
  
  messages: Annotation<Message[]>({
    reducer: (prev = [], next = []) => [...prev, ...next],
    default: () => [],
  }),
  
  context: Annotation<Record<string, any>>({
    reducer: (prev = {}, next = {}) => ({ ...prev, ...next }),
    default: () => ({}),
  }),
  
  error: Annotation<string | undefined>({
    reducer: (_, next) => next,
  }),
  
  ok: Annotation<boolean | undefined>({
    reducer: (_, next) => next,
  }),
  
  retryCount: Annotation<number>({
    reducer: (prev = 0, next = 0) => prev + next,
    default: () => 0,
  }),
});
```

### Building Graph

```typescript
build(graph: GraphDocument, userId: string) {
  const runtime = new StateGraph(State);
  
  // Build adjacency list từ edges
  const adjList = this.buildAdjacencyList(graph.edges);
  
  // Tìm start và end nodes
  const startNode = graph.nodes.find((n) => n.type === 'start');
  const endNode = graph.nodes.find((n) => n.type === 'end');
  
  // Thêm nodes dựa trên type
  for (const node of graph.nodes) {
    const handler = this.createNodeHandler(node, userId);
    if (handler) {
      runtime.addNode(node.id, handler);
    }
  }
  
  // Thêm edge từ START
  runtime.addEdge(START, firstNodeId);
  
  // Thêm các edges khác
  for (const edge of graph.edges) {
    if (edge.target === endNode.id) {
      runtime.addEdge(edge.source, END);
    } else {
      runtime.addEdge(edge.source, edge.target);
    }
  }
  
  return runtime.compile();
}
```

### Streaming Execution

```typescript
async *runStream(
  graph: GraphDocument,
  input: string,
  userId?: string,
): AsyncGenerator<any> {
  const app = this.build(graph, userId || '');
  
  const initialState: StateType = {
    input,
    output: undefined,
    messages: [],
    context: {},
    error: undefined,
    ok: false,
    retryCount: 0,
  };
  
  const stream = await app.stream(initialState);
  
  for await (const event of stream) {
    yield event;
  }
}
```

---

## Best Practices

### 1. State Design

```typescript
// ✅ Good: Typed, với defaults và reducers
export const State = Annotation.Root({
  data: Annotation<string>({
    reducer: (_, next) => next,
    default: () => '',
  }),
});

// ❌ Bad: Untyped, no defaults
const state = { data: undefined };
```

### 2. Error Handling

```typescript
// ✅ Good: Catch errors và update state
const safeNode = async (state: StateType) => {
  try {
    const result = await riskyOperation();
    return { output: result, ok: true };
  } catch (error) {
    return { 
      error: error.message, 
      ok: false,
      retryCount: 1,
    };
  }
};
```

### 3. Node Composition

```typescript
// ✅ Good: Small, focused nodes
graph.addNode('validate', validateInput);
graph.addNode('process', processData);
graph.addNode('format', formatOutput);

// ❌ Bad: Monolithic node
graph.addNode('doEverything', megaNode);
```

### 4. Logging & Debugging

```typescript
// ✅ Good: Logging ở mỗi node
const loggingNode = async (state: StateType) => {
  this.logger.debug(`Processing: ${state.input}`);
  const result = await process(state);
  this.logger.debug(`Result: ${result.output}`);
  return result;
};
```

---

## Tài liệu tham khảo

- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph GitHub](https://github.com/langchain-ai/langgraph)
- [@langchain/langgraph npm](https://www.npmjs.com/package/@langchain/langgraph)
- [LangSmith](https://www.langchain.com/langsmith)

---

*Tài liệu này được tạo cho dự án MCP Workflow Backend - Sử dụng LangGraph với NestJS và TypeScript.*
