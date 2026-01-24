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
          <Text fontSize="sm" fontWeight="medium" color="gray.300">
            Temperature
          </Text>
          <Text fontSize="sm" color="purple.400" fontWeight="medium">
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
            <Slider.Track bg="rgba(255, 255, 255, 0.1)" h="6px" borderRadius="full">
              <Slider.Range bg="linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)" />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              bg="white"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
              _hover={{ transform: "scale(1.1)" }}
            />
          </Slider.Control>
        </Slider.Root>
      </Box>
    </VStack>
  );
};
