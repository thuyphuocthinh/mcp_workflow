import { ChatMain } from "@/components/chat/ChatMain";
import { Box, Flex, Text, CloseButton, Icon } from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa";

type DebugPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  if (!isOpen) return null;

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
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
        bg="rgba(99, 102, 241, 0.1)"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Box
            py={1}
            px={2}
            borderRadius="md"
            bg="rgba(99, 102, 241, 0.3)"
          >
            <Icon as={FaPlay} boxSize={4} color="purple.400" />
          </Box>
          <Text fontSize="sm" fontWeight="600" color="white">
            Debug Workflow
          </Text>
        </Flex>

        <CloseButton
          size="sm"
          color="gray.400"
          borderRadius="lg"
          _hover={{
            bg: "rgba(255, 255, 255, 0.1)",
            color: "white",
            transform: "rotate(90deg)",
          }}
          transition="all 0.2s"
          onClick={onClose}
        />
      </Flex>

      {/* Chat */}
      <Box
        flex={1}
        overflow="hidden"
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
        <ChatMain isPlayground={false} />
      </Box>
    </Flex>
  );
}
