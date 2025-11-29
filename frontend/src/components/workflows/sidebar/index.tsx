import { Tooltip } from "@/components/ui/tooltip";
import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import {
  LuPlay,
  LuGitBranch,
  LuFileInput,
  LuDatabase,
  LuSend,
  LuCode,
  LuSettings,
  LuCloud,
  LuMessageSquare,
  LuClipboard,
} from "react-icons/lu";

const nodes = [
  { id: "1", name: "Start", icon: LuPlay },
  { id: "2", name: "Input", icon: LuFileInput },
  { id: "3", name: "Process", icon: LuDatabase },
  { id: "4", name: "Decision", icon: LuGitBranch },
  { id: "5", name: "Output", icon: LuSend },
  // Thêm 5 node mới
  { id: "6", name: "Script", icon: LuCode }, // Chạy script/custom code
  { id: "7", name: "Config", icon: LuSettings }, // Cấu hình workflow
  { id: "8", name: "API Call", icon: LuCloud }, // Gọi API
  { id: "9", name: "Message", icon: LuMessageSquare }, // Gửi thông báo
  { id: "10", name: "Log", icon: LuClipboard }, // Ghi log
];

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeId: string
) => {
  // Truyền dữ liệu khi drop
  event.dataTransfer.setData("application/reactflow", nodeId);
  event.dataTransfer.effectAllowed = "copy"; // copy, không move

  // Tạo clone để drag (custom drag image)
  const target = event.currentTarget as HTMLDivElement;
  const clone = target.cloneNode(true) as HTMLElement;

  // Style clone (rõ nét hơn, background trắng)
  clone.style.background = "white";
  clone.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
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
        {nodes.map((node) => {
          const Icon = node.icon;

          return (
            <Tooltip
              content={node.name}
              showArrow={true}
              positioning={{ placement: "right" }}
            >
              <HStack
                key={node.id}
                p={4}
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
                  onDragStart(e, node.id)
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
                title={node.name}
              >
                <Icon size={18} color="#4A5568" />
                <Text fontSize="sm" fontWeight="medium">
                  {node.name}
                </Text>
              </HStack>
            </Tooltip>
          );
        })}
      </VStack>
    </VStack>
  );
};
