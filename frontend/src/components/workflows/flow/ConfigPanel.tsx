import { Box, CloseButton } from "@chakra-ui/react";
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
    <Box
      position="relative"
      right={0}
      top={0}
      h="calc(100vh - 168px)"
      w="420px"
      bg="white"
      borderLeft="1px solid"
      borderColor="gray.200"
      zIndex={10}
      borderRadius="md"
      boxShadow="sm"
      css={{
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          width: "8px",
          background: "var(--chakra-colors-gray-50)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "var(--chakra-colors-gray-300)",
          borderRadius: "24px",
        },
      }}
      overflowY="auto"
    >
      <CloseButton
        onClick={onClose}
        position="absolute"
        right={4}
        top={3}
        size="md"
        borderRadius="full"
        transition="all 0.2s"
        zIndex={1}
        _hover={{
          bg: "gray.100",
          transform: "rotate(90deg)",
        }}
      />
      {getNodePropertiesComponent(
        nodes.find((n) => n.id === selectedNodeId) || null
      )}
    </Box>
  );
};
