import { LuPlay, LuBot, LuCircle, LuUser } from "react-icons/lu";

interface NodeConfigItem {
  label: string;
  icon: React.ComponentType;
  colorScheme: string;
  allowedConnections: {
    sources: string[];
    targets: string[];
  };
  inputVariables: string[] | null;
  outputVariables: string[] | null;
  properties?: React.ComponentType<any>;
  initialData?: Record<string, any>;
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
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
    inputVariables: [],
    outputVariables: ["response"],
  },
  agent: {
    label: "Agent",
    icon: LuUser,
    colorScheme: "yellow",
    allowedConnections: {
      sources: ["left", "right"],
      targets: ["left", "right"],
    },
    outputVariables: ["response"],
    inputVariables: [],
    initialData: {
      model: "glm-4-flash",
      temperature: 0.1,
      systemMessage: "",
      userMessage: "",
      tools: [{}],
      retrievalTools: [],
    },
  },
};

export type NodeType = keyof typeof nodeConfig; // "start" | "end" | "llm" | "agent"
