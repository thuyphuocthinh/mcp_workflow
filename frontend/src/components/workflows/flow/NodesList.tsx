// NodesList.tsx
import { Tooltip } from "@/components/ui/tooltip";
import { VStack, HStack, Box, Text } from "@chakra-ui/react";
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
  itemPadding = 4,
}: Props) => {
  return (
    <VStack
      bg="white"
      align="stretch"
      gap="12px"
      p={4}
      flex="1"
      width="100%"
      overflow="auto"
    >
      {Object.entries(nodeConfig).map(
        ([nodeType, { label, icon: Icon, colorScheme }]) => {
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
                borderColor="gray.200"
                borderRadius="md"
                bg="white"
                transition="all 0.2s ease"
                _hover={{
                  bg: "gray.50",
                  boxShadow: "xl",
                }}
                title={label}
              >
                <Box background={`${colorScheme}.200`} p={2} borderRadius="sm">
                  <Icon />
                </Box>

                <Text fontSize="xs" fontWeight="medium">
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
