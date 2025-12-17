import type { ChatMessage } from "@/types";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { FaRobot, FaUser } from "react-icons/fa";

type Props = {
  workflowName?: string;
  messages: ChatMessage[];
  chatInput: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
};

export function ChatMain({
  workflowName,
  messages,
  chatInput,
  onInputChange,
  onSend,
}: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Flex flex={1} direction="column">
      <Box p={4} borderBottom="1px solid" borderColor="gray.200">
        <Heading size="sm">{workflowName}</Heading>
      </Box>

      <Box flex={1} p={4} overflowY="auto">
        <VStack align="stretch" gap={4}>
          {messages.map((msg) => {
            const isHuman = msg.role === "HUMAN";
            return (
              <Flex key={msg.id} justify={isHuman ? "flex-end" : "flex-start"}>
                <HStack
                  maxW="70%"
                  bg={isHuman ? "blue.500" : "gray.100"}
                  color={isHuman ? "white" : "gray.800"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                >
                  {isHuman ? <FaUser /> : <FaRobot />}
                  <Text fontSize="sm">{msg.content}</Text>
                </HStack>
              </Flex>
            );
          })}
          <Box ref={bottomRef} />
        </VStack>
      </Box>

      <HStack p={4} borderTop="1px solid" borderColor="gray.200">
        <Input
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />
        <Button colorScheme="blue" onClick={onSend}>
          Send
        </Button>
      </HStack>
    </Flex>
  );
}
