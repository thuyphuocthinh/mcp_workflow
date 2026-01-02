import type { Workflow } from "@/types";
import {
  Box,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import { type UIEvent } from "react";

type Props = {
  workflows: Workflow[];
  search: string;
  selectedId: string | null;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
  onScrollEnd?: () => void;
  isLoading?: boolean;
  isFetchingNextPage: boolean;
};

export function ChatBotList({
  workflows,
  search,
  selectedId,
  onSearch,
  onSelect,
  onScrollEnd,
  isLoading,
  isFetchingNextPage,
}: Props) {
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 10;

    if (isBottom && onScrollEnd && !isLoading) {
      onScrollEnd();
    }
  };

  return (
    <Box
      w="280px"
      borderRight="1px solid"
      borderColor="gray.200"
      p={4}
      pb={0}
      display="flex"
      flexDir="column"
    >
      <Heading size="sm" mb={3}>
        Workflows
      </Heading>

      <Input
        placeholder="Search workflow..."
        mb={3}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <VStack
        align="stretch"
        gap={1}
        flex={1}
        overflowY="auto"
        pb="20px"
        onScroll={handleScroll}
      >
        {workflows.map((wf) => (
          <Box
            key={wf.id}
            p={3}
            borderRadius="md"
            cursor="pointer"
            bg={wf.id === selectedId ? "blue.50" : "transparent"} // Đổi màu xám sang xanh nhạt cho nổi bật
            color={wf.id === selectedId ? "blue.600" : "inherit"}
            _hover={{ bg: "gray.100" }}
            onClick={() => onSelect(wf.id)}
            display="flex"
            gap="8px"
            alignItems="center"
            transition="all 0.2s"
          >
            <Box
              w="40px"
              h="40px"
              borderRadius="md"
              bg={wf.id === selectedId ? "blue.100" : "gray.100"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaRobot color={wf.id === selectedId ? "#3182ce" : "inherit"} />
            </Box>
            <Text fontSize="sm" fontWeight="600">
              {wf.name}
            </Text>
          </Box>
        ))}

        {(isLoading || isFetchingNextPage) && (
          <Center p={4}>
            <Spinner size="sm" color="blue.500" />
          </Center>
        )}
      </VStack>
    </Box>
  );
}
