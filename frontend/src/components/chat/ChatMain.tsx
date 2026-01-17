import { TOKEN_KEY } from "@/constants";
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";

type Props = {
  isPlayground: boolean;
  workflowName?: string;
};

export function ChatMain({ workflowName, isPlayground = true }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStoppedRef = useRef(false); // Track if streaming was manually stopped
  const [searchParams] = useSearchParams();
  const { id: routeWorkflowId } = useParams<{ id: string }>();
  // Support both query params (?workflowId=xxx) and route params (:id)
  const workflowId = searchParams.get("workflowId") || routeWorkflowId;
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [workflowId]);

  const appendMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const appendToMessageTyping = async (
    id: string,
    text: string,
    speed = 15 // ms / ký tự
  ) => {
    for (let i = 0; i < text.length; i++) {
      // Stop typing effect immediately when user stops streaming
      if (isStoppedRef.current) return;
      await new Promise((r) => setTimeout(r, speed));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, content: msg.content + text[i] } : msg
        )
      );
    }
  };

  const stopStreaming = () => {
    isStoppedRef.current = true; // Signal to stop typing effect
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  };

  const handleSend = async () => {
    if (!chatInput.trim() || isStreaming || !workflowId) return;

    // abort stream cũ nếu còn
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isStoppedRef.current = false; // Reset stop flag for new message

    const humanMsg: ChatMessage = {
      id: uuidv4(),
      role: "HUMAN",
      content: chatInput,
      created_at: new Date().toISOString(),
    };

    appendMessage(humanMsg);
    setChatInput("");
    setIsStreaming(true);

    const aiMsgId = uuidv4();

    appendMessage({
      id: aiMsgId,
      role: "AI",
      content: "",
      created_at: new Date().toISOString(),
    });

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const baseApi = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${baseApi}/graphs/${workflowId}/run/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            input: humanMsg.content,
          }),
          signal: controller.signal,
        }
      );

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          if (event.includes("event: end")) {
            stopStreaming();
            return;
          }

          // if (!event.startsWith("data:")) continue;

          const json = event.replace("data:", "").trim();
          const data = JSON.parse(json);

          if (data.output) {
            await appendToMessageTyping(aiMsgId, data.output);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Stream error:", err);
      }
    } finally {
      stopStreaming();
    }
  };

  return (
    <Flex flex={1} direction="column" height={"100%"}>
      {/* Header */}
      {isPlayground && (
        <Box p={4} borderBottom="1px solid" borderColor="gray.200" display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="sm">{workflowName ?? "Chat"}</Heading>
          <Button
            size="xs"
            colorScheme="gray"
            onClick={() => navigate(`/workflows/${workflowId}`)}
          >
            Go to Workflow
          </Button>
        </Box>
      )}

      {/* Messages */}
      <Box flex={1} p={4} overflowY="auto" position="relative">
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
                  alignItems={isHuman ? "center" : "flex-start"}
                >
                  <Box>
                    {isHuman ? <FaUser size={16} /> : <FaRobot size={20} />}
                  </Box>
                  {isHuman ? (
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {msg.content}
                    </Text>
                  ) : (
                    <Box>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </Box>
                  )}
                </HStack>
              </Flex>
            );
          })}
          <Box ref={bottomRef} />
        </VStack>
      </Box>

      <VStack pt={2}>
        {/* Stop Streaming Button */}
        {isStreaming && (
          <Button
            size="sm"
            colorScheme="red"
            zIndex={10}
            onClick={stopStreaming}
            boxShadow="lg"
          >
            Stop generating
          </Button>
        )}
        {/* Input */}
        <HStack p={4} borderTop="1px solid" borderColor="gray.200" w={"100%"}>
          <Input
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            colorScheme={isStreaming ? "red" : "blue"}
            onClick={handleSend}
            loading={isStreaming}
          >
            Send
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
}
