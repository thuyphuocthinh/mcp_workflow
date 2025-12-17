import {
  Box,
  Flex,
  VStack,
  HStack,
  Input,
  Text,
  Heading,
  Button,
} from "@chakra-ui/react";
import { useMemo, useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaRobot, FaUser } from "react-icons/fa";

/* ================== Types ================== */

type Workflow = {
  id: string;
  name: string;
};

type ChatMessage = {
  id: string;
  role: "HUMAN" | "AI";
  content: string;
  created_at: string;
};

/* ================== Fake workflows ================== */

const fakeWorkflows: Workflow[] = Array.from({ length: 30 }).map((_, i) => ({
  id: uuidv4(),
  name: `Workflow ${i + 1}`,
}));

/* ================== Fake chats ================== */

const fakeWorkflowChats: Record<string, ChatMessage[]> = Object.fromEntries(
  fakeWorkflows.map((wf) => [
    wf.id,
    [
      {
        id: uuidv4(),
        role: "HUMAN",
        content: `Hello AI, this is ${wf.name}`,
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        role: "AI",
        content: `Hi! I'm AI responding to ${wf.name}`,
        created_at: new Date().toISOString(),
      },
    ],
  ])
);

/* ================== Page ================== */

export default function ChatPage() {
  const [search, setSearch] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    fakeWorkflows[0].id
  );
  const [chatInput, setChatInput] = useState("");
  const [chats, setChats] =
    useState<Record<string, ChatMessage[]>>(fakeWorkflowChats);

  /* ---------- Memo ---------- */

  const workflowMap = useMemo(
    () => new Map(fakeWorkflows.map((w) => [w.id, w])),
    []
  );

  const filteredWorkflows = useMemo(() => {
    const keyword = search.toLowerCase();
    return fakeWorkflows.filter((wf) =>
      wf.name.toLowerCase().includes(keyword)
    );
  }, [search]);

  const messages = chats[selectedWorkflowId] ?? [];

  const selectedWorkflow = workflowMap.get(selectedWorkflowId);

  /* ---------- Auto scroll ---------- */

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- Logic ---------- */

  const appendMessage = (workflowId: string, msg: ChatMessage) => {
    setChats((prev) => ({
      ...prev,
      [workflowId]: [...(prev[workflowId] ?? []), msg],
    }));
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;

    appendMessage(selectedWorkflowId, {
      id: uuidv4(),
      role: "HUMAN",
      content: chatInput,
      created_at: new Date().toISOString(),
    });

    setChatInput("");

    // fake AI response
    setTimeout(() => {
      appendMessage(selectedWorkflowId, {
        id: uuidv4(),
        role: "AI",
        content: "This is a fake AI response 🤖",
        created_at: new Date().toISOString(),
      });
    }, 500);
  };

  /* ================== Render ================== */

  return (
    <Flex h="calc(100vh - 72.8px)" overflow="hidden">
      {/* ================= Sidebar ================= */}
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
          onChange={(e) => setSearch(e.target.value)}
        />

        <VStack align="stretch" gap={1} flex={1} overflowY="auto" pb="20px">
          {filteredWorkflows.map((wf) => (
            <Box
              key={wf.id}
              p={3}
              borderRadius="md"
              cursor="pointer"
              bg={wf.id === selectedWorkflowId ? "gray.300" : "transparent"}
              _hover={{ bg: "gray.200" }}
              onClick={() => setSelectedWorkflowId(wf.id)}
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
                <FaRobot size={20} color="#4A5568" />
              </Box>
              <Text fontSize="sm" fontWeight="500">
                {wf.name}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* ================= Chat main ================= */}
      <Flex flex={1} direction="column">
        {/* Header */}
        <Box p={4} borderBottom="1px solid" borderColor="gray.200">
          <Heading size="sm">{selectedWorkflow?.name}</Heading>
        </Box>

        {/* Messages */}
        <Box flex={1} p={4} overflowY="auto">
          <VStack align="stretch" gap={4}>
            {messages.map((msg) => {
              const isHuman = msg.role === "HUMAN";

              return (
                <Flex
                  key={msg.id}
                  justify={isHuman ? "flex-end" : "flex-start"}
                >
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
    </Flex>
  );
}
