import { ChatMain } from "@/components/chat/ChatMain";
import type { ChatMessage } from "@/types";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerBody,
} from "@chakra-ui/react";

type DebugPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
};

export function DebugPanel({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSend,
}: DebugPanelProps) {
  return (
    <DrawerRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      placement="right"
      size="md"
    >
      <DrawerBackdrop />
      <DrawerContent p={0}>
        <DrawerBody p={0}>
          <ChatMain
            workflowName={"Debug Workflow"}
            messages={messages}
            chatInput={input}
            onInputChange={onInputChange}
            onSend={onSend}
          />
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
}
