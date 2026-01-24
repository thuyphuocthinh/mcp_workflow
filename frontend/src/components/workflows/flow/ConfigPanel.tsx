import { Box, CloseButton, Flex } from "@chakra-ui/react";
import type { Node } from "@xyflow/react";

interface ConfigPanelProps {
  selectedNodeId: string;
  onClose: () => void;
  getNodePropertiesComponent: (node: Node | null) => React.ReactNode;
  nodes: Node[];
}

export const ConfigPanel = ({
  selectedNodeId,
  onClose,
  getNodePropertiesComponent,
  nodes,
}: ConfigPanelProps) => {
  return (
    <Flex
      direction="column"
      position="relative"
      right={0}
      top={0}
      h="calc(100vh - 160px)"
      maxH="calc(100vh - 160px)"
      w="420px"
      bg="rgba(20, 20, 30, 0.95)"
      backdropFilter="blur(20px)"
      borderLeft="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      zIndex={10}
      borderRadius="md"
      boxShadow="0 0 40px rgba(0, 0, 0, 0.5)"
      overflow="hidden"
    >
      {/* Close button - positioned absolute to top right */}
      <CloseButton
        onClick={onClose}
        position="absolute"
        right={3}
        top={3}
        size="sm"
        borderRadius="full"
        transition="all 0.2s"
        zIndex={20}
        color="gray.400"
        _hover={{
          bg: "rgba(255, 255, 255, 0.1)",
          color: "white",
          transform: "rotate(90deg)",
        }}
      />

      {/* Scrollable content */}
      <Box
        flex="1"
        overflowY="auto"
        pt={2}
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            width: "8px",
            background: "rgba(255, 255, 255, 0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(99, 102, 241, 0.3)",
            borderRadius: "24px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(99, 102, 241, 0.5)",
          },
        }}
      >
        {getNodePropertiesComponent(
          nodes.find((n) => n.id === selectedNodeId) || null
        )}
      </Box>
    </Flex>
  );
};
