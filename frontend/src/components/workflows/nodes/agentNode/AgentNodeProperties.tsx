import { ModelSelect } from "@/components/common/ModelSelect";
import type { VariableReference } from "../baseConfig/variableSystem";
import { VariableSelector } from "@/components/common/VariableSelector";
import ToolSelector from "@/components/common/ToolSelector";
import { tools } from "@/constants/tools";
import type { Tool } from "@/types";
import { useCallback } from "react";

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
  const onToolsChange = useCallback(
    (tools: Tool[]) => {
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
    },
    [node.id, onNodeDataChange]
  );

  return (
    <>
      <ModelSelect
        value={node.data.model}
        onChange={(m) => {
          onNodeDataChange(node.id, "model", m);
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
        value={node.data.tools || []}
        onChange={onToolsChange}
      />
    </>
  );
};
