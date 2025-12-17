import { Flex } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatBotList } from "@/components/chat/ChatBotList";
import { ChatMain } from "@/components/chat/ChatMain";
import type { ChatMessage, Workflow } from "@/types";

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
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(
    fakeWorkflows[0].id
  );
  const [chatInput, setChatInput] = useState("");
  const [chats, setChats] =
    useState<Record<string, ChatMessage[]>>(fakeWorkflowChats);

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

    setTimeout(() => {
      appendMessage(selectedWorkflowId, {
        id: uuidv4(),
        role: "AI",
        content: "This is a fake AI response 🤖",
        created_at: new Date().toISOString(),
      });
    }, 500);
  };

  return (
    <Flex h="calc(100vh - 72.8px)" overflow="hidden">
      <ChatBotList
        workflows={filteredWorkflows}
        search={search}
        onSearch={setSearch}
        selectedId={selectedWorkflowId}
        onSelect={setSelectedWorkflowId}
      />

      <ChatMain
        workflowName={selectedWorkflow?.name}
        messages={messages}
        chatInput={chatInput}
        onInputChange={setChatInput}
        onSend={handleSend}
      />
    </Flex>
  );
}
