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
  Icon,
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
    <Flex flex={1} direction="column" height={"100%"} bg="transparent">
      {/* Header */}
      {isPlayground && (
        <Box
          p={4}
          borderBottom="1px solid"
          borderColor="rgba(255, 255, 255, 0.08)"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="rgba(20, 20, 30, 0.6)"
          backdropFilter="blur(10px)"
        >
          <Heading size="sm" color="white">{workflowName ?? "Chat"}</Heading>
          <Button
            size="xs"
            variant="outline"
            color="gray.300"
            borderColor="rgba(255, 255, 255, 0.1)"
            onClick={() => navigate(`/workflows/${workflowId}`)}
            _hover={{
              bg: "rgba(99, 102, 241, 0.2)",
              borderColor: "rgba(99, 102, 241, 0.4)",
            }}
          >
            Go to Workflow
          </Button>
        </Box>
      )}

      {/* Messages */}
      <Box
        flex={1}
        p={4}
        overflowY="auto"
        position="relative"
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
        <VStack align="stretch" gap={4}>
          {messages.map((msg) => {
            const isHuman = msg.role === "HUMAN";
            return (
              <Flex key={msg.id} justify={isHuman ? "flex-end" : "flex-start"}>
                <HStack
                  maxW="70%"
                  bg={isHuman
                    ? "linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
                    : "rgba(255, 255, 255, 0.08)"
                  }
                  color={isHuman ? "white" : "gray.200"}
                  px={4}
                  py={3}
                  borderRadius="xl"
                  alignItems={isHuman ? "center" : "flex-start"}
                  border="1px solid"
                  borderColor={isHuman ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)"}
                  boxShadow={isHuman
                    ? "0 4px 20px rgba(99, 102, 241, 0.3)"
                    : "0 4px 20px rgba(0, 0, 0, 0.2)"
                  }
                >
                  <Box>
                    {isHuman ? (
                      <Icon as={FaUser} boxSize={4} color="white" />
                    ) : (
                      <Icon as={FaRobot} boxSize={5} color="purple.400" />
                    )}
                  </Box>
                  {isHuman ? (
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {msg.content}
                    </Text>
                  ) : (
                    <Box
                      css={{
                        "& p": { margin: 0 },
                        "& code": {
                          background: "rgba(99, 102, 241, 0.2)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.85em",
                        },
                        "& pre": {
                          background: "rgba(0, 0, 0, 0.3)",
                          padding: "12px",
                          borderRadius: "8px",
                          overflowX: "auto",
                        },
                      }}
                    >
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
            bg="rgba(239, 68, 68, 0.8)"
            color="white"
            zIndex={10}
            onClick={stopStreaming}
            boxShadow="0 4px 20px rgba(239, 68, 68, 0.3)"
            _hover={{
              bg: "rgba(239, 68, 68, 1)",
            }}
          >
            Stop generating
          </Button>
        )}
        {/* Input */}
        <HStack
          p={4}
          borderTop="1px solid"
          borderColor="rgba(255, 255, 255, 0.08)"
          w={"100%"}
          bg="rgba(20, 20, 30, 0.6)"
          backdropFilter="blur(10px)"
        >
          <Input
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
          <Button
            bg={isStreaming
              ? "rgba(239, 68, 68, 0.8)"
              : "linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
            }
            color="white"
            onClick={handleSend}
            loading={isStreaming}
            _hover={{
              bg: isStreaming
                ? "rgba(239, 68, 68, 1)"
                : "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)",
            }}
          >
            Send
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
}
