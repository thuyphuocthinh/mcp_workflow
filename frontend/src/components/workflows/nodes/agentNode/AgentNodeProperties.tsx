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
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
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
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
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
            <Field.Label fontSize="sm" fontWeight="medium" color="gray.300">
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
              <NumberInput.IncrementTrigger
                color="gray.400"
                _hover={{ color: "white", bg: "rgba(99, 102, 241, 0.2)" }}
              />
              <NumberInput.DecrementTrigger
                color="gray.400"
                _hover={{ color: "white", bg: "rgba(99, 102, 241, 0.2)" }}
              />
            </NumberInput.Control>
            <NumberInput.Input
              bg="rgba(255, 255, 255, 0.05)"
              color="white"
              borderColor="rgba(255, 255, 255, 0.1)"
              _hover={{ borderColor: "rgba(99, 102, 241, 0.4)" }}
              _focus={{
                borderColor: "rgba(99, 102, 241, 0.6)",
                boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.3)",
              }}
            />
          </NumberInput.Root>
        </Field.Root>
      </Box>
    </VStack>
  );
};
