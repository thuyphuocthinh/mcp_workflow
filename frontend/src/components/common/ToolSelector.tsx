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
          <Text fontWeight="600">Tools</Text>
          <Dialog.Trigger asChild>
            <Button size="sm" variant="outline" gap={2}>
              <FiPlus />
              Add tools
            </Button>
          </Dialog.Trigger>
        </HStack>

        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="xl">
              <Dialog.Header>
                <Dialog.Title>Select tools</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                {/* Search */}
                <Input
                  placeholder="Search tools..."
                  mb={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                {/* Tool list */}
                <VStack align="stretch" gap={2} maxH="360px" overflowY="auto">
                  {filteredTools.map((tool) => {
                    const isSelected = pending.some((t) => t.id === tool.id);

                    return (
                      <Card.Root
                        key={tool.id}
                        cursor="pointer"
                        borderRadius="md"
                        borderWidth="1px"
                        bg={isSelected ? "blue.50" : "transparent"}
                        borderColor={isSelected ? "blue.400" : "gray.200"}
                        _hover={{ borderColor: "blue.400" }}
                        onClick={() => togglePending(tool)}
                      >
                        <Card.Body>
                          <Flex align="center" justify="space-between">
                            <Flex align="center" gap={3}>
                              <Icon as={getToolIcon(tool.key)} boxSize={4} />
                              <Text fontSize="sm" fontWeight="medium">
                                {tool.name}
                              </Text>
                            </Flex>

                            {isSelected && (
                              <Icon as={FiCheck} color="blue.500" />
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

              <Dialog.Footer>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={commit}
                  disabled={pending.length === 0}
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
            <Card.Root key={tool.id} size="sm" borderRadius="md">
              <Card.Body py={2}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={2}>
                    <Icon as={getToolIcon(tool.key)} boxSize={4} />
                    <Text fontSize="sm" fontWeight="medium">
                      {tool.name}
                    </Text>
                  </Flex>

                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
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
