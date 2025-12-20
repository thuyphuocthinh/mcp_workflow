import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

import { nodeConfig } from "../baseConfig/nodeConfig";
import { BaseNode } from "../baseConfig/BaseNode";
import { Box, Card, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import type { Tool } from "@/types";
import { toolIconMap, type ToolKey } from "@/components/common/ToolIcons";
import type { AIModel } from "@/components/common/ModelSelect";

const AgentNode: React.FC<NodeProps> = (props) => {
  const { icon: IconProp, colorScheme } = nodeConfig.agent;
  const tools: Tool[] = Array.isArray(props.data.tools) ? props.data.tools : [];
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
            <FaRobot />
          </Icon>
          <Text fontSize="xs" ml={2} color="gray.700" fontWeight="500">
            {((props.data.model as AIModel).name as string) ||
              "No model selected"}
          </Text>
        </Box>
      </VStack>

      {tools.length > 0 && (
        <VStack align="stretch" gap={2} mt={3}>
          {tools.map((tool) => (
            <Card.Root key={tool.id} size="sm" borderRadius="md">
              <Card.Body py={2}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Icon as={toolIconMap[tool.key as ToolKey]} boxSize={4} />
                    <Text fontSize="sm" fontWeight="medium">
                      {tool.name}
                    </Text>
                  </Flex>
                </Flex>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}
    </BaseNode>
  );
};

export default React.memo(AgentNode, (prevProps, nextProps) => {
  return (
    prevProps.data.model === nextProps.data.model &&
    prevProps.data.label === nextProps.data.label &&
    JSON.stringify(prevProps.data.tools) ===
      JSON.stringify(nextProps.data.tools) &&
    JSON.stringify(prevProps.data.retrievalTools) ===
      JSON.stringify(nextProps.data.retrievalTools)
  );
});
