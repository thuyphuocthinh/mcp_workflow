import type { Node, NodeTypes } from "@xyflow/react";
import StartNode from "../startNode/StartNode";
import EndNode from "../endNode/EndNode";
import LLMNode from "../llmNode/LLMNode";
import AgentNode from "../agentNode/AgentNode";
import PluginNode from "../pluginNode/PluginNode";
import RetrievalNode from "../retrievalNode/RetrievalNode";
import ToolRetrievalNode from "../toolretrievalNode/ToolRetrievalNode";
import CrewAiNode from "../crewaiNode/CrewAiNode";
import ClassifierNode from "../classifierNode/ClassifierNode";
import AnswerNode from "../answerNode/AnswerNode";
import CodeNode from "../codeNode/CodeNode";
import IfElseNode from "../ifelseNode/IfElseNode";
import HumanNode from "../humanNode/HumanNode";
import ParamExtractorNode from "../parameterExtractorNode/ParamExtractorNode";

interface SavedTool {
  id: number;
  name: string;
  provider: string;
}

export interface NodeData {
  label: string;
  isCut?: boolean;
  onChange?: (key: string, value: any) => void;
  model?: string;
  temperature?: number;
  tool?: string[] | SavedTool;
  [key: string]: any;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: SavedTool[];
  allow_delegation?: boolean;
}

export interface TaskConfig {
  name: string;
  description: string;
  agent_id: string;
  expected_output?: string;
  output_json?: any;
  context?: string[];
}

export interface CrewAINodeData extends NodeData {
  agents: AgentConfig[];
  tasks: TaskConfig[];
  process_type: "sequential" | "hierarchical";
  llm_config: {
    model: string;
  };
  manager_config: {
    agent?: AgentConfig;
  };
}

export interface CustomNode extends Node {
  data: NodeData | CrewAINodeData;
}

export const CustomNodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  agent: AgentNode,
  plugin: PluginNode,
  retrieval: RetrievalNode,
  toolretrieval: ToolRetrievalNode,
  crewai: CrewAiNode,
  classifier: ClassifierNode,
  answer: AnswerNode,
  code: CodeNode,
  ifelse: IfElseNode,
  human: HumanNode,
  parameterExtractor: ParamExtractorNode
}

export const LogicalOperator = {
  and: "and",
  or: "or",
} as const;

export type LogicalOperator = typeof LogicalOperator[keyof typeof LogicalOperator];
