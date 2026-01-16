import {
  StateGraph,
  START,
  END,
  Annotation,
} from '@langchain/langgraph';
import { Injectable, Logger } from '@nestjs/common';
import { GraphDocument } from '../schemas/graphs.schema';
import { NodeRegistry } from '../registry/node.registry';
import { FALLBACK_PROMPT } from '../constants/graph.constants';
import {
  FlowNode,
  FlowEdge,
  LLMNodeData,
  MCPToolNodeData,
  AgentNodeData,
} from '../types/graph.types';
import { Message } from '../types/langraph.types';

// ─────────────────────────────────────────────────────────────
// State Definition for LangGraph
// ─────────────────────────────────────────────────────────────

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

export type StateType = typeof State.State;

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

@Injectable()
export class WorkflowRuntimeService {
  private readonly logger = new Logger(WorkflowRuntimeService.name);

  constructor(private readonly nodeRegistry: NodeRegistry) {}

  /**
   * Build a LangGraph StateGraph from a GraphDocument
   */
  build(graph: GraphDocument, userId: string) {
    const runtime = new StateGraph(State);

    // Build adjacency list from edges
    const adjList = this.buildAdjacencyList(graph.edges);

    // Find special nodes
    const startNode = graph.nodes.find((n) => n.type === 'start');
    const endNode = graph.nodes.find((n) => n.type === 'end');

    if (!startNode || !endNode) {
      throw new Error('Graph must have start and end nodes');
    }

    this.logger.debug(`Building graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);

    // Add nodes based on type
    for (const node of graph.nodes) {
      const handler = this.createNodeHandler(node, userId);
      if (handler) {
        this.logger.debug(`Adding node: ${node.id} (${node.type})`);
        runtime.addNode(node.id, handler);
      }
    }

    // Add edges
    const firstNodeId = adjList.get(startNode.id)?.[0];
    
    if (firstNodeId && firstNodeId !== endNode.id) {
      this.logger.debug(`Adding edge: START -> ${firstNodeId}`);
      runtime.addEdge(START, firstNodeId as any);
    } else {
      // Direct connection from start to end - no nodes in between
      this.logger.warn('No nodes between start and end');
    }

    for (const edge of graph.edges) {
      // Skip edges from start node (already handled)
      if (edge.source === startNode.id) continue;

      if (edge.target === endNode.id) {
        this.logger.debug(`Adding edge: ${edge.source} -> END`);
        runtime.addEdge(edge.source as any, END);
      } else {
        this.logger.debug(`Adding edge: ${edge.source} -> ${edge.target}`);
        runtime.addEdge(edge.source as any, edge.target as any);
      }
    }

    return runtime.compile();
  }

  /**
   * Run the workflow and stream events
   */
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

    this.logger.debug(`Starting workflow with input: "${input.substring(0, 100)}..."`);

    const stream = await app.stream(initialState);

    for await (const event of stream) {
      yield event;
    }
  }

  /**
   * Run the workflow and return final state
   */
  async run(
    graph: GraphDocument,
    input: string,
    userId?: string,
  ): Promise<StateType> {
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

    const result = await app.invoke(initialState);
    return result;
  }

  private createNodeHandler(node: FlowNode, userId: string) {
    switch (node.type) {
      case 'llm':
        if (!node.data) {
          throw new Error(`LLM node ${node.id} missing data`);
        }
        return this.nodeRegistry.createLLMNode(node.data as LLMNodeData);

      case 'mcp-tool':
        if (!node.data) {
          throw new Error(`MCP Tool node ${node.id} missing data`);
        }
        return this.nodeRegistry.createMCPToolNode(
          node.data as MCPToolNodeData,
          userId,
        );

      case 'agent':
        if (!node.data) {
          throw new Error(`Agent node ${node.id} missing data`);
        }
        return this.nodeRegistry.createAgentNode(
          node.data as AgentNodeData,
          userId,
        );

      case 'start':
      case 'end':
        return null; // No handler needed for start/end

      default:
        // For backward compatibility, treat unknown types as LLM nodes
        // if they have the right data structure
        if (node.data && 'userPrompt' in node.data && 'provider' in node.data) {
          this.logger.warn(`Unknown node type "${node.type}", treating as LLM node`);
          return this.nodeRegistry.createLLMNode(node.data as LLMNodeData);
        }
        
        // Fall back to legacy llm() method
        this.logger.warn(`Unknown node type "${node.type}" with no data, using legacy LLM`);
        return this.nodeRegistry.llm();
    }
  }

  private buildAdjacencyList(edges: FlowEdge[]): Map<string, string[]> {
    const adjList = new Map<string, string[]>();

    for (const edge of edges) {
      if (!adjList.has(edge.source)) {
        adjList.set(edge.source, []);
      }
      adjList.get(edge.source)!.push(edge.target);
    }

    return adjList;
  }
}
