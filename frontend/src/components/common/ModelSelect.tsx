"use client";

import {
  Box,
  Card,
  HStack,
  VStack,
  Text,
  Menu,
  Icon,
  Portal,
} from "@chakra-ui/react";
import { FaRobot } from "react-icons/fa";
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

/* ================== Types ================== */

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

/* ================== Fake models ================== */

const FAKE_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Best for reasoning, coding, and chat",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    description: "Fast and cheap, good for workflows",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Great at long context and writing",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Strong multimodal & large context",
  },
  {
    id: "llama-3-70b",
    name: "LLaMA 3 70B",
    provider: "Meta",
    description: "Open-source, high quality responses",
  },
];

/* ================== Component ================== */

type ModelSelectProps = {
  value?: AIModel;
  onChange?: (model: AIModel) => void;
};

export function ModelSelect({ value, onChange }: ModelSelectProps) {
  const [selected, setSelected] = useState<AIModel | undefined>(value);

  // sync controlled value
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (model: AIModel) => {
    setSelected(model);
    onChange?.(model);
  };

  return (
    <Menu.Root positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger
        asChild
        cursor="pointer"
        px={4}
        py={2}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        transition="all 0.2s ease"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: "sm",
          borderColor: "blue.300",
          bg: "gray.50",
        }}
        _active={{
          transform: "translateY(0)",
          boxShadow: "xs",
        }}
        _focusVisible={{
          outline: "none",
          borderColor: "blue.400",
          boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
        }}
      >
        <HStack justify="space-between" w="full">
          <HStack>
            <Icon as={FaRobot} color="blue.500" />
            <VStack align="start" gap={0}>
              <Text fontWeight="medium">
                {selected?.name ?? "Select AI Model"}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {selected?.provider ?? "Choose a model"}
              </Text>
            </VStack>
          </HStack>
          <FiChevronDown fontSize={"16px"} />
        </HStack>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="360px" w={"full"} p="2">
            <VStack align="stretch" gap="2">
              {FAKE_MODELS.map((model) => {
                const isSelected = selected?.id === model.id;

                return (
                  <Menu.Item
                    value={model.id}
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    p="0"
                    borderRadius="md"
                    bg={isSelected ? "blue.50" : "transparent"}
                    _hover={{ bg: "gray.50" }}
                    cursor={"pointer"}
                  >
                    <Card.Root
                      variant="subtle"
                      w="full"
                      borderWidth="1px"
                      borderColor={isSelected ? "blue.400" : "border"}
                      _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                        borderColor: "blue.300",
                      }}
                      transition="all 0.1s ease-in-out"
                    >
                      <HStack align="start" gap="3">
                        <Box
                          p="2"
                          borderRadius="md"
                          bg={isSelected ? "blue.100" : "gray.100"}
                        >
                          <Icon as={FaRobot} />
                        </Box>

                        <VStack align="start" gap="1">
                          <HStack>
                            <Text fontWeight="semibold">{model.name}</Text>
                            <Text fontSize="xs" color="fg.muted">
                              · {model.provider}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="fg.muted">
                            {model.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card.Root>
                  </Menu.Item>
                );
              })}
            </VStack>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
