import {
  Box,
  Card,
  Text,
  Flex,
  Icon,
  Button,
  Dialog,
  Input,
  VStack,
  Portal,
  HStack,
} from "@chakra-ui/react";
import { FiPlus, FiCheck } from "react-icons/fi";
import { useMemo, useState } from "react";
import type { Tool } from "@/types";
import { getToolIcon } from "./ToolIcons";

type ToolSelectorProps = {
  tools: Tool[];
  value?: Tool[];
  onChange?: (tools: Tool[]) => void;
};

export default function ToolSelector({
  tools,
  value = [],
  onChange,
}: ToolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Tool[]>([]);

  const selectedIds = useMemo(() => new Set(value.map((t) => t.id)), [value]);

  const filteredTools = useMemo(() => {
    return tools.filter(
      (t) =>
        !selectedIds.has(t.id) &&
        t.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [tools, selectedIds, query]);

  const togglePending = (tool: Tool) => {
    setPending((prev) =>
      prev.some((t) => t.id === tool.id)
        ? prev.filter((t) => t.id !== tool.id)
        : [...prev, tool]
    );
  };

  const commit = () => {
    onChange?.([...value, ...pending]);
    setPending([]);
    setQuery("");
    setOpen(false);
  };

  const removeTool = (id: string) => {
    onChange?.(value.filter((t) => t.id !== id));
  };

  return (
    <Box>
      {/* Tools modal*/}
      <Dialog.Root
        open={open}
        onOpenChange={({ open }) => {
          setOpen(open);
          if (!open) {
            setPending([]);
            setQuery("");
          }
        }}
        size="md"
      >
        <HStack w={"100%"} justify="space-between" mb={3}>
          <Text fontWeight="600" color="gray.300">Tools</Text>
          <Dialog.Trigger asChild>
            <Button
              size="sm"
              variant="outline"
              gap={2}
              color="gray.300"
              borderColor="rgba(255, 255, 255, 0.1)"
              _hover={{
                bg: "rgba(99, 102, 241, 0.2)",
                borderColor: "rgba(99, 102, 241, 0.4)",
              }}
            >
              <FiPlus />
              Add tools
            </Button>
          </Dialog.Trigger>
        </HStack>

        <Portal>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              borderRadius="xl"
              bg="rgba(20, 20, 30, 0.98)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="0 0 60px rgba(0, 0, 0, 0.5)"
            >
              <Dialog.Header borderBottom="1px solid rgba(255, 255, 255, 0.08)">
                <Dialog.Title color="white">Select tools</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                {/* Search */}
                <Input
                  placeholder="Search tools..."
                  mb={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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

                {/* Tool list */}
                <VStack align="stretch" gap={2} maxH="360px" overflowY="auto">
                  {filteredTools.map((tool) => {
                    const isSelected = pending.some((t) => t.id === tool.id);

                    return (
                      <Card.Root
                        key={tool.id}
                        cursor="pointer"
                        borderRadius="lg"
                        borderWidth="1px"
                        bg={isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)"}
                        borderColor={isSelected ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.08)"}
                        _hover={{
                          borderColor: "rgba(99, 102, 241, 0.4)",
                          bg: "rgba(99, 102, 241, 0.1)",
                        }}
                        transition="all 0.2s"
                        onClick={() => togglePending(tool)}
                      >
                        <Card.Body>
                          <Flex align="center" justify="space-between">
                            <Flex align="center" gap={3}>
                              <Icon as={getToolIcon(tool.key)} boxSize={4} color="gray.400" />
                              <Text fontSize="sm" fontWeight="medium" color="white">
                                {tool.name}
                              </Text>
                            </Flex>

                            {isSelected && (
                              <Icon as={FiCheck} color="purple.400" />
                            )}
                          </Flex>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}

                  {filteredTools.length === 0 && (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      No tools found
                    </Text>
                  )}
                </VStack>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid rgba(255, 255, 255, 0.08)">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  color="gray.400"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)", color: "white" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={commit}
                  disabled={pending.length === 0}
                  bg="linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)"
                  color="white"
                  _hover={{
                    bg: "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                >
                  Add selected ({pending.length})
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Selected tools list */}
      {value.length > 0 && (
        <VStack align="stretch" gap={2} mt={3}>
          {value.map((tool) => (
            <Card.Root
              key={tool.id}
              size="sm"
              borderRadius="lg"
              bg="rgba(255, 255, 255, 0.03)"
              borderColor="rgba(255, 255, 255, 0.08)"
            >
              <Card.Body py={2}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Icon as={getToolIcon(tool.key)} boxSize={4} color="gray.400" />
                    <Text fontSize="sm" fontWeight="medium" color="white">
                      {tool.name}
                    </Text>
                  </Flex>

                  <Button
                    size="xs"
                    variant="ghost"
                    color="red.400"
                    _hover={{
                      bg: "rgba(239, 68, 68, 0.2)",
                    }}
                    onClick={() => removeTool(tool.id)}
                  >
                    Remove
                  </Button>
                </Flex>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}
    </Box>
  );
}
