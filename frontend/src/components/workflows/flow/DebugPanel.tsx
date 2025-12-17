import { ChatMain } from "@/components/chat/ChatMain";
import { Box, IconButton, Flex, Text, CloseButton } from "@chakra-ui/react";

type DebugPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  if (!isOpen) return null;

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
      display="flex"
      flexDir="column"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        px={3}
        py={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="gray.50"
      >
        <Text fontSize="sm" fontWeight="600">
          Debug Workflow
        </Text>

        <IconButton
          aria-label="Close debug panel"
          size="xs"
          variant="ghost"
          onClick={onClose}
        >
          <CloseButton fontSize={16} />
        </IconButton>
      </Flex>

      {/* Chat */}
      <Box flex={1} overflow="hidden">
        <ChatMain isPlayground={false} />
      </Box>
    </Box>
  );
}
