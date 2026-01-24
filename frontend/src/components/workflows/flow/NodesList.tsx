// NodesList.tsx
import { Tooltip } from "@/components/ui/tooltip";
import { VStack, HStack, Box, Text, Icon } from "@chakra-ui/react";
import { nodeConfig } from "../nodes/baseConfig/nodeConfig";
import { NO_ACTION_NODES } from "../constants";

type Props = {
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
  onSelect?: (nodeType: string) => void;
  itemPadding?: number;
};

export const NodesList = ({
  draggable = false,
  onDragStart,
  onSelect,
  itemPadding = 3,
}: Props) => {
  return (
    <VStack
      bg="transparent"
      align="stretch"
      gap="10px"
      p={3}
      flex="1"
      width="100%"
      overflow="auto"
      css={{
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255, 255, 255, 0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(99, 102, 241, 0.3)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(99, 102, 241, 0.5)",
        },
      }}
    >
      {Object.entries(nodeConfig).map(
        ([nodeType, { label, icon: NodeIcon, colorScheme }]) => {
          if (NO_ACTION_NODES.includes(nodeType)) return null;

          return (
            <Tooltip
              key={nodeType}
              content={label}
              showArrow
              positioning={{ placement: "right" }}
            >
              <HStack
                p={itemPadding}
                draggable={draggable}
                cursor={draggable ? "all-scroll" : "pointer"}
                onDragStart={
                  draggable && onDragStart
                    ? (e) => onDragStart(e, nodeType)
                    : undefined
                }
                onClick={onSelect ? () => onSelect(nodeType) : undefined}
                _active={draggable ? { cursor: "grabbing" } : undefined}
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderRadius="xl"
                bg="rgba(255, 255, 255, 0.03)"
                backdropFilter="blur(10px)"
                transition="all 0.2s ease"
                _hover={{
                  bg: "rgba(99, 102, 241, 0.15)",
                  borderColor: "rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.2)",
                  transform: "translateX(4px)",
                }}
                title={label}
              >
                <Box
                  bg={`${colorScheme}.500`}
                  p={2}
                  borderRadius="lg"
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={NodeIcon} color="white" boxSize={4} />
                </Box>

                <Text fontSize="xs" fontWeight="medium" color="gray.300">
                  {label}
                </Text>
              </HStack>
            </Tooltip>
          );
        }
      )}
    </VStack>
  );
};
