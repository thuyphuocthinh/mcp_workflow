import type { Workflow } from "@/types";
import {
  Box,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
  Center,
  Icon,
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
      borderColor="rgba(255, 255, 255, 0.08)"
      p={4}
      pb={0}
      display="flex"
      flexDir="column"
      bg="rgba(20, 20, 30, 0.95)"
      backdropFilter="blur(20px)"
    >
      <Heading size="sm" mb={3} color="gray.300" letterSpacing="1px">
        Workflows
      </Heading>

      <Input
        placeholder="Search workflow..."
        mb={3}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        bg="rgba(255, 255, 255, 0.05)"
        color="white"
        borderColor="rgba(255, 255, 255, 0.1)"
        _placeholder={{ color: "gray.500" }}
        _hover={{ borderColor: "rgba(99, 102, 241, 0.4)" }}
        _focus={{
          borderColor: "rgba(99, 102, 241, 0.6)",
          boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.3)",
        }}
      />

      <VStack
        align="stretch"
        gap={2}
        flex={1}
        overflowY="auto"
        pb="20px"
        onScroll={handleScroll}
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
        {workflows.map((wf) => (
          <Box
            key={wf.id}
            p={3}
            borderRadius="lg"
            cursor="pointer"
            bg={wf.id === selectedId ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)"}
            border="1px solid"
            borderColor={wf.id === selectedId ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.05)"}
            _hover={{
              bg: "rgba(99, 102, 241, 0.15)",
              borderColor: "rgba(99, 102, 241, 0.4)",
              transform: "translateX(4px)",
            }}
            onClick={() => onSelect(wf.id)}
            display="flex"
            gap="12px"
            alignItems="center"
            transition="all 0.2s"
          >
            <Box
              w="40px"
              h="40px"
              borderRadius="lg"
              bg={wf.id === selectedId ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.1)"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={FaRobot}
                color={wf.id === selectedId ? "purple.400" : "gray.500"}
                boxSize={4}
              />
            </Box>
            <Text
              fontSize="sm"
              fontWeight="600"
              color={wf.id === selectedId ? "white" : "gray.300"}
            >
              {wf.name}
            </Text>
          </Box>
        ))}

        {(isLoading || isFetchingNextPage) && (
          <Center p={4}>
            <Spinner size="sm" color="purple.400" />
          </Center>
        )}
      </VStack>
    </Box>
  );
}
