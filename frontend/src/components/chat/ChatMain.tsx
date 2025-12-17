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
import { useEffect, useRef, useState } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

type Props = {
  isPlayground: boolean;
  workflowName?: string;
};

export function ChatMain({ workflowName, isPlayground = true }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ================= Auto scroll ================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= Logic ================= */

  const appendMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;

    const humanMsg: ChatMessage = {
      id: uuidv4(),
      role: "HUMAN",
      content: chatInput,
      created_at: new Date().toISOString(),
    };

    appendMessage(humanMsg);
    setChatInput("");

    // fake AI response (sau này thay bằng real debug / chat API)
    setTimeout(() => {
      appendMessage({
        id: uuidv4(),
        role: "AI",
        content: "This is a debug response 🤖",
        created_at: new Date().toISOString(),
      });
    }, 500);
  };

  /* ================= Render ================= */

  return (
    <Flex flex={1} direction="column" height={"100%"}>
      {/* Header */}
      {isPlayground && (
        <Box p={4} borderBottom="1px solid" borderColor="gray.200">
          <Heading size="sm">{workflowName ?? "Chat"}</Heading>
        </Box>
      )}

      {/* Messages */}
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

      {/* Input */}
      <HStack p={4} borderTop="1px solid" borderColor="gray.200">
        <Input
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button colorScheme="blue" onClick={handleSend}>
          Send
        </Button>
      </HStack>
    </Flex>
  );
}
