import {
  StateGraph,
  START,
  END,
  Annotation,
} from "@langchain/langgraph";
import { Injectable } from "@nestjs/common";
import { GraphDocument } from "../schemas/graphs.schema";
import { NodeRegistry } from "../registry/node.registry";
import { FALLBACK_PROMPT } from "../constants/graph.constants";
import { v4 } from "uuid";

export const State = Annotation.Root({
  input: Annotation<string>({
    reducer: (prev, next) => next ?? prev ?? FALLBACK_PROMPT,
    default: () => FALLBACK_PROMPT,
  }),

  output: Annotation<string | undefined>({
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


@Injectable()
export class WorkflowRuntimeService {
  constructor(private readonly nodeRegistry: NodeRegistry) {}

    build(graph: GraphDocument) {
      const runtime = new StateGraph(State);

      let llmNodeId: string | undefined;
      let evaluatorNodeId: string | undefined;

      /* ---------- add nodes ---------- */
      for (const node of graph.nodes) {
        if (node.type === "llm") {
            llmNodeId = node.id;
            runtime.addNode(node.id, this.nodeRegistry.llm());
        }

        evaluatorNodeId = v4();
        runtime.addNode(evaluatorNodeId, this.nodeRegistry.evaluator());
      }

      if (!llmNodeId || !evaluatorNodeId) {
        throw new Error("Graph must have llm and evaluator nodes");
      }

      /* ---------- edges ---------- */
      runtime.addEdge(START, llmNodeId as any);
      runtime.addEdge(llmNodeId as any, evaluatorNodeId as any);

      runtime.addConditionalEdges(
        evaluatorNodeId as any,
        (state) => {
            if (!state.ok && state.retryCount < 3) {
              return llmNodeId!;
            }
            return END;
        },
      );

      return runtime.compile();
    }

    async *runStream(
      graph: GraphDocument,
      input: string,
    ): AsyncGenerator<any> {
      const app = this.build(graph);

      const initialState = {
        input,
        output: undefined,
        ok: false,
        retryCount: 0,
      };

      const stream = await app.stream(initialState);

      for await (const event of stream) {
        yield event;
      }
    }
    /*
      async function* = hàm sinh ra dữ liệu theo thời gian
      yield = push 1 event ra ngoài ngay lập tức
      generator sẽ bị pause cho tới khi consumer consume event đó (bằng cách .next())
      async generator => nó bị pause do bất đồng bộ từ stream của graph
    */
}
