import { Tooltip } from "@/components/ui/tooltip";
import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import { nodeConfig } from "../nodes/baseConfig/nodeConfig";

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeId: string
) => {
  // Truyền dữ liệu khi drop
  event.dataTransfer.setData("application/reactflow", nodeId);
  event.dataTransfer.effectAllowed = "copyMove"; // copy, không move

  // Tạo clone để drag (custom drag image)
  const target = event.currentTarget as HTMLDivElement;
  const clone = target.cloneNode(true) as HTMLElement;

  // Style clone (rõ nét hơn, background trắng)
  clone.style.background = "white";
  clone.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
  clone.style.opacity = "1"; // bỏ mờ
  clone.style.border = "1px solid #CBD5E0"; // giống gốc
  clone.style.borderRadius = "6px";
  clone.style.width = "200px";

  // Phải append vào body để setDragImage
  clone.style.position = "absolute";
  clone.style.top = "-1000px"; // ra ngoài màn hình
  document.body.appendChild(clone);

  // Set drag image
  event.dataTransfer.setDragImage(
    clone,
    clone.offsetWidth / 2,
    clone.offsetHeight / 2
  );

  // Sau khi drag start xong remove clone
  setTimeout(() => {
    document.body.removeChild(clone);
  }, 0);
};

export const NodesSidebar = () => {
  return (
    <VStack height="full">
      <Box
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        width="100%"
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.600"
          textTransform="uppercase"
          letterSpacing="0.8px"
        >
          Nodes
        </Text>
      </Box>

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
            return (
              <Tooltip
                content={label}
                showArrow={true}
                positioning={{ placement: "right" }}
              >
                <HStack
                  key={nodeType}
                  p={4}
                  draggable
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
                    onDragStart(e, nodeType)
                  }
                  cursor="all-scroll"
                  _active={{ cursor: "grabbing" }}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                  spacing={6}
                  transition="all 0.2s ease"
                  _hover={{
                    bg: "gray.50",
                    boxShadow: "xl",
                  }}
                  title={label}
                >
                  <Box
                    background={`${colorScheme}.200`}
                    p={2}
                    borderRadius={"sm"}
                  >
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
    </VStack>
  );
};
