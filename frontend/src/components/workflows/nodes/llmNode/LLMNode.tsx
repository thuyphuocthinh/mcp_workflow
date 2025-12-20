import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";

import { nodeConfig } from "../baseConfig/nodeConfig";
import { BaseNode } from "../baseConfig/BaseNode";
import { Box, Icon, Text, VStack } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import type { AIModel } from "@/components/common/ModelSelect";

const LLMNode: React.FC<NodeProps> = (props) => {
  const { icon: IconProp, colorScheme } = nodeConfig.llm;

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
    </BaseNode>
  );
};

export default React.memo(LLMNode);
