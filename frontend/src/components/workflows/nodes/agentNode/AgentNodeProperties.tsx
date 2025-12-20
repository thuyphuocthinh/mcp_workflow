import { ModelSelect, type AIModel } from "@/components/common/ModelSelect";
import type { VariableReference } from "../baseConfig/variableSystem";
import { useState } from "react";
import { VariableSelector } from "@/components/common/VariableSelector";
import ToolSelector from "@/components/common/ToolSelector";
import { tools } from "@/constants/tools";
import type { Tool } from "@/types";

interface AgentNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

export const AgentNodeProperties = ({
  node,
  onNodeDataChange,
  availableVariables,
}: AgentNodePropertiesProps) => {
  const [model, setModel] = useState<AIModel>();
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);

  const onToolsChange = (tools: Tool[]) => {
    setSelectedTools(tools);
    onNodeDataChange(
      node.id,
      "tools",
      tools.map((tool) => {
        return {
          id: tool.id,
          name: tool.name,
          key: tool.key,
          description: tool.description,
        };
      })
    );
  };

  return (
    <>
      <ModelSelect
        value={model}
        onChange={(m) => {
          setModel(m);
          onNodeDataChange(node.id, "model", m?.name || "");
        }}
      />

      <VariableSelector
        value={node.data.prompt}
        availableVariables={availableVariables}
        onChange={(val) => onNodeDataChange(node.id, "prompt", val)}
        label="User Prompt"
      />

      <ToolSelector
        tools={tools}
        value={selectedTools}
        onChange={onToolsChange}
      />
    </>
  );
};
