import type { Workflow } from "@/types";
import { Box, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";

type Props = {
  workflows: Workflow[];
  search: string;
  selectedId: string;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
};

export function ChatBotList({
  workflows,
  search,
  selectedId,
  onSearch,
  onSelect,
}: Props) {
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

      <VStack align="stretch" gap={1} flex={1} overflowY="auto" pb="20px">
        {workflows.map((wf) => (
          <Box
            key={wf.id}
            p={3}
            borderRadius="md"
            cursor="pointer"
            bg={wf.id === selectedId ? "gray.300" : "transparent"}
            _hover={{ bg: "gray.200" }}
            onClick={() => onSelect(wf.id)}
            display="flex"
            gap="8px"
            alignItems="center"
          >
            <Box
              w="40px"
              h="40px"
              borderRadius="md"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaRobot />
            </Box>
            <Text fontSize="sm" fontWeight="500">
              {wf.name}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
