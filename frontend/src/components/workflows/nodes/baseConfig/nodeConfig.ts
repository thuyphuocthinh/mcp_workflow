import { LogicalOperator } from './nodeType';
import { LuPlay, LuBot, LuCircle, LuUser, LuGithub, LuBook, LuDatabase, LuBrainCircuit, LuGroup, LuCode, LuCrosshair, LuCodepen, LuUserCog, LuReply } from "react-icons/lu";
import { v4 } from "uuid";
import { LLMNodeProperties } from '../llmNode/LLMNodeProperties';
import { AgentNodeProperties } from '../agentNode/AgentNodeProperties';

interface NodeConfigItem {
  label: string;
  icon: React.ComponentType;
  colorScheme: string;
  allowedConnections: {
    sources: string[];
    targets: string[];
  };
  inputVariables: string[] | null;
  properties?: React.ComponentType<any>;
  initialData?: Record<string, any>;
  outputVariables: string[] | ((data: any) => { name: string; type: string }[]);
  outputSchema?: any
}

export const nodeConfig: Record<string, NodeConfigItem> = {
  start: {
    label: "Start",
    icon: LuPlay,
    colorScheme: "green",
    allowedConnections: {
      sources: ["right"],
      targets: [],
    },
    inputVariables: [],
    outputVariables: ["query"],
  },
  end: {
    label: "End",
    icon: LuCircle,
    colorScheme: "pink",
    allowedConnections: {
      sources: [],
      targets: ["left"],
    },
    inputVariables: [],
    outputVariables: [],
  },
  llm: {
    label: "LLM",
    icon: LuBot,
    colorScheme: "blue",
    properties: LLMNodeProperties,
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
    initialData: {
      model: {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI",
        description: "Best for reasoning, coding, and chat",
      },
      temperature: 0.1,
      systemMessage: "",
      userMessage: "${start.query}",
    },
    inputVariables: [],
    outputVariables: ["response"],
  },
  agent: {
    label: "Agent",
    icon: LuUser,
    colorScheme: "yellow",
    properties: AgentNodeProperties,
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
    outputVariables: ["response"],
    inputVariables: [],
    initialData: {
      model: {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI",
        description: "Best for reasoning, coding, and chat",
      },
      temperature: 0.1,
      systemMessage: "",
      userMessage: "",
      tools: [],
      retrievalTools: [],
    },
  },
   plugin: {
    label: "Plugin",
    icon: LuGithub,
    colorScheme: "gray",
    // properties: PluginNodeProperties,
    initialData: {
      toolName: "",
      args: "",
      tool: {
        id: 2,
        name: "Math Calculator",
        provider: "math",
      },
    },
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    inputVariables: [],
    outputVariables: ["response"],
    outputSchema: {
      response: 'String'
    }
  },

  retrieval: {
    label: "KB Retrieval",
    icon: LuBook,
    colorScheme: "red",
    // properties: RetrievalProperties,
    initialData: {
      query: null,
      rag_method: "Adaptive_RAG",
      knownledge_database: [],
      usr_id: "",
      kb_id: "",
    },
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    inputVariables: [],
    outputVariables: ["response"],
    outputSchema: {
      response: 'String'
    }
  },
  toolretrieval: {
    label: "Retrieval As Tools",
    icon: LuDatabase,
    colorScheme: "teal",
    // properties: RetrievalToolNodeProperties,
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    initialData: {
      tools: [],
    },
    inputVariables: [],
    outputVariables: ["response"],
    outputSchema: {
      response: 'String'
    }
  },
  crewai: {
    label: "CrewAI",
    icon: LuGroup,
    colorScheme: "purple",
    // properties: CrewAINodeProperties,
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    initialData: {
      agents: [],
      tasks: [],
      process_type: "sequential",
      llm_config: {},
      manager_config: {},
    },
    inputVariables: [],
    outputVariables: ["response"],
    outputSchema: {
      response: 'String'
    }
  },
  classifier: {
    icon: LuBrainCircuit,
    label: "Intent Recognition",
    colorScheme: "pink",
    // properties: ClassifierNodeProperties,
    allowedConnections: {
      sources: [],
      targets: ["input"],
    },
    outputVariables: ["class_name"],
    outputSchema: {
      class_name: 'String'
    },
    inputVariables: ["Input"],
    initialData: {
      categories: [
        { category_id: v4(), category_name: "" },
        { category_id: "others_category", category_name: "Others Intent" },
      ],
      model: "glm-4-flash",
    },
  },
  answer: {
    label: "Answer",
    icon: LuReply,
    colorScheme: "orange",
    // properties: AnswerNodeProperties,
    initialData: {
      answer: null,
    },
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    inputVariables: [],
    outputVariables: ["response"],
    outputSchema: {
      response: 'String'
    }
  },
  code: {
    label: "Code Execution",
    icon: LuCode,
    colorScheme: "purple",
    // properties: CodeNodeProperties,
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    outputVariables: ["code_result"],
    outputSchema: {
      code_result: 'String'
    },
    inputVariables: [],
    initialData: {
      code: "",
      language: "python",
    },
  },
  ifelse: {
    label: "If-Else",
    icon: LuCodepen,
    colorScheme: "purple",
    // properties: IfElseNodeProperties,
    initialData: {
      cases: [
        {
          case_id: v4(),
          logical_operator: LogicalOperator.and,
          conditions: [],
        },
        {
          case_id: "false_else",
          logical_operator: LogicalOperator.and,
          conditions: [],
        },
      ],
    },
    allowedConnections: {
      sources: [],
      targets: ["left"],
    },
    inputVariables: [],
    outputVariables: ["result"],
    outputSchema: {
      result: 'String'
    }
  },
  human: {
    label: "Human Interaction",
    icon: LuUserCog,
    colorScheme: "purple",
    // properties: HumanNodeProperties,
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    inputVariables: [],
    outputVariables: ["response", "action"],
    outputSchema: {
      response: 'String',
      action: 'String'
    },
    initialData: {
      interaction_type: "tool_review",
      routes: {
        approved: "",
        rejected: "",
        update: "",
        feedback: "",
      },
      title: "",
    },
  },
  parameterExtractor: {
    label: "Parameter Extractor",
    icon: LuCrosshair,
    colorScheme: "cyan",
    // properties: ParameterExtractorNodeProperties,
    allowedConnections: {
      sources: ["right"],
      targets: ["left"],
    },
    initialData: {
      model: "glm-4-flash",
      parameters: [],
      toolImport: null,
    },
    inputVariables: ["Input"],
    outputVariables: (data: any): { name: string; type: string }[] => {
      if (data && Array.isArray(data.parameters)) {
        return data.parameters.map((param: any) => {
          const name = Object.keys(param)[0];
          const type = param[name]?.type || 'any';
          return { name, type }; // 确保返回的是包含 name 和 type 的对象
        });
      }
      return [];
    },
  },
};

export type INodeConfig = keyof typeof nodeConfig; // "start" | "end" | "llm" | "agent"
