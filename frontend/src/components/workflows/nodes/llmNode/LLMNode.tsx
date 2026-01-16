import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

import { nodeConfig } from "../baseConfig/nodeConfig";
import { BaseNode } from "../baseConfig/BaseNode";
import { Box, Icon, Text, VStack } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import { SiOpenai, SiGooglegemini } from "react-icons/si";
import { TbBrandMeta } from "react-icons/tb";

// Get display name and icon for model
const getModelDisplay = (provider?: string, model?: string) => {
  if (!provider && !model) return { name: "No model selected", icon: FaRobot };

  const icons: Record<string, React.ElementType> = {
    openai: SiOpenai,
    gemini: SiGooglegemini,
    anthropic: TbBrandMeta,
  };

  const icon = icons[provider || ""] || FaRobot;
  const name = model || "No model selected";

  return { name, icon };
};

const LLMNode: React.FC<NodeProps> = (props) => {
  const { icon: IconProp, colorScheme } = nodeConfig.llm;

  // Support both old format (model as object) and new format (model as string)
  const modelData = props.data?.model as string | { name?: string } | undefined;
  const provider = props.data?.provider as string | undefined;

  let displayName: string;
  let ModelIcon: React.ElementType = FaRobot;

  if (modelData && typeof modelData === "object" && "name" in modelData && modelData.name) {
    // Old format: model is an object with name property
    displayName = modelData.name;
  } else if (typeof modelData === "string") {
    // New format: model is a string ID
    const display = getModelDisplay(provider, modelData);
    displayName = display.name;
    ModelIcon = display.icon;
  } else {
    displayName = "No model selected";
  }

  return (
    <BaseNode {...props} icon={<IconProp />} colorScheme={colorScheme}>
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: "#3182ce",
          width: 22,
          height: 22,
          border: "2px solid white",
          transition: "all 0.2s",
        }}
        className="custom-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: "#3182ce",
          width: 22,
          height: 22,
          border: "2px solid white",
          transition: "all 0.2s",
        }}
        className="custom-handle"
      />
      <VStack gap={1}>
        <Box
          bg="ui.inputbgcolor"
          borderRadius="md"
          w="full"
          p="2"
          display="flex"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          transition="all 0.2s"
          _hover={{
            bg: "gray.100",
          }}
        >
          <Icon color="blue.500">
            <ModelIcon />
          </Icon>
          <Text fontSize="xs" ml={2} color="gray.700" fontWeight="500">
            {displayName}
          </Text>
        </Box>
      </VStack>
    </BaseNode>
  );
};

export default React.memo(LLMNode);
