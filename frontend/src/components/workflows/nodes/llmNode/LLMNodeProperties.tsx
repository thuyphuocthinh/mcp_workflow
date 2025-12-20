import { ModelSelect, type AIModel } from "@/components/common/ModelSelect";
import { useState } from "react";
import type { VariableReference } from "../baseConfig/variableSystem";
import { VariableSelector } from "@/components/common/VariableSelector";

interface LLMNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

export const LLMNodeProperties = ({
  node,
  onNodeDataChange,
  availableVariables,
}: LLMNodePropertiesProps) => {
  const [model, setModel] = useState<AIModel>();

  return (
    <>
      <ModelSelect
        value={model}
        onChange={(m) => {
          setModel(m);
          onNodeDataChange(node.id, "model", m);
        }}
      />

      <VariableSelector
        value={node.data.prompt}
        availableVariables={availableVariables}
        onChange={(val) => onNodeDataChange(node.id, "prompt", val)}
        label="User Prompt"
      />
    </>
  );
};
