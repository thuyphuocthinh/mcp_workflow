import { ModelSelect, type ModelSelectValue } from "@/components/common/ModelSelect";
import type { VariableReference } from "../baseConfig/variableSystem";
import { VariableSelector } from "@/components/common/VariableSelector";
import ToolSelector from "@/components/common/ToolSelector";
import { tools as availableTools } from "@/constants/tools";
import type { Tool } from "@/types";
import { useCallback } from "react";
import { VStack, Text, Box, HStack, NumberInput, Field } from "@chakra-ui/react";

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
  const currentValue: ModelSelectValue | undefined =
    node.data.provider && node.data.model
      ? { provider: node.data.provider, model: node.data.model }
      : undefined;

  // Convert mcpServers back to Tool[] for display
  const selectedTools = availableTools.filter((tool) =>
    (node.data.mcpServers || []).includes(tool.key)
  );

  const onToolsChange = useCallback(
    (tools: Tool[]) => {
      // Convert Tool[] to mcpServers (string[])
      const mcpServers = tools.map((tool) => tool.key);
      onNodeDataChange(node.id, "mcpServers", mcpServers);
    },
    [node.id, onNodeDataChange]
  );

  return (
    <VStack align="stretch" gap={4}>
      {/* Model Selection */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={2}>
          AI Model
        </Text>
        <ModelSelect
          value={currentValue}
          onChange={(val) => {
            onNodeDataChange(node.id, "provider", val.provider);
            onNodeDataChange(node.id, "model", val.model);
          }}
        />
      </Box>

      {/* System Prompt */}
      <VariableSelector
        value={node.data.systemPrompt || ""}
        availableVariables={availableVariables}
        onChange={(val) => onNodeDataChange(node.id, "systemPrompt", val)}
        label="System Prompt"
        placeholder="Instructions for the agent..."
      />

      {/* MCP Servers / Tools */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={2}>
          Tools (MCP Servers)
        </Text>
        <ToolSelector
          tools={availableTools}
          value={selectedTools}
          onChange={onToolsChange}
        />
      </Box>

      {/* Max Iterations */}
      <Box>
        <Field.Root>
          <HStack justify="space-between">
            <Field.Label fontSize="sm" fontWeight="medium">
              Max Iterations
            </Field.Label>
            <Text fontSize="xs" color="gray.500">
              (ReAct loop limit)
            </Text>
          </HStack>
          <NumberInput.Root
            min={1}
            max={50}
            value={String(node.data.maxIterations ?? 10)}
            onValueChange={(details) =>
              onNodeDataChange(node.id, "maxIterations", details.valueAsNumber)
            }
          >
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
            <NumberInput.Input />
          </NumberInput.Root>
        </Field.Root>
      </Box>
    </VStack>
  );
};
