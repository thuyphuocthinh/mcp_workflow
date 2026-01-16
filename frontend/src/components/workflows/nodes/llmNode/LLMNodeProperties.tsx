import { ModelSelect, type ModelSelectValue } from "@/components/common/ModelSelect";
import type { VariableReference } from "../baseConfig/variableSystem";
import { VariableSelector } from "@/components/common/VariableSelector";
import { VStack, Text, HStack, Box } from "@chakra-ui/react";
import { Slider } from "@chakra-ui/react";

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
  const currentValue: ModelSelectValue | undefined =
    node.data.provider && node.data.model
      ? { provider: node.data.provider, model: node.data.model }
      : undefined;

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
        placeholder="Optional: Instructions for the AI..."
      />

      {/* User Prompt */}
      <VariableSelector
        value={node.data.userPrompt || ""}
        availableVariables={availableVariables}
        onChange={(val) => onNodeDataChange(node.id, "userPrompt", val)}
        label="User Prompt"
        placeholder="Enter your prompt here... Use ${node.variable} for variables"
      />

      {/* Temperature */}
      <Box>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="medium">
            Temperature
          </Text>
          <Text fontSize="sm" color="gray.500">
            {node.data.temperature ?? 0.7}
          </Text>
        </HStack>
        <Slider.Root
          min={0}
          max={2}
          step={0.1}
          value={[node.data.temperature ?? 0.7]}
          onValueChange={(details) =>
            onNodeDataChange(node.id, "temperature", details.value[0])
          }
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0} />
          </Slider.Control>
        </Slider.Root>
      </Box>
    </VStack>
  );
};
