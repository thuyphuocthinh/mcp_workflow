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
import { SiOpenai, SiGooglegemini } from "react-icons/si";
import { TbBrandMeta } from "react-icons/tb";

/* ================== Types ================== */

export type LLMProvider = "openai" | "gemini" | "anthropic";

export type AIModel = {
  id: string;
  name: string;
  provider: LLMProvider;
  description: string;
};

export type ModelSelectValue = {
  provider: LLMProvider;
  model: string;
};

/* ================== Available models ================== */

const AVAILABLE_MODELS: AIModel[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Best for reasoning, coding, and chat",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast and cheap, good for workflows",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "High performance with vision support",
  },
  // Gemini
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Fast and efficient, great for streaming",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "gemini",
    description: "Strong multimodal & large context",
  },
  // Anthropic
  {
    id: "claude-3-5-sonnet-latest",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Great at long context and writing",
  },
  {
    id: "claude-3-opus-latest",
    name: "Claude 3 Opus",
    provider: "anthropic",
    description: "Most capable, best for complex tasks",
  },
];

const providerIcons: Record<LLMProvider, React.ElementType> = {
  openai: SiOpenai,
  gemini: SiGooglegemini,
  anthropic: TbBrandMeta,
};

const providerColors: Record<LLMProvider, string> = {
  openai: "green.500",
  gemini: "blue.500",
  anthropic: "orange.500",
};

/* ================== Component ================== */

type ModelSelectProps = {
  value?: ModelSelectValue;
  onChange?: (value: ModelSelectValue) => void;
};

// Default model if none selected
const DEFAULT_MODEL = AVAILABLE_MODELS[0]; // gpt-4o

export function ModelSelect({ value, onChange }: ModelSelectProps) {
  const [selected, setSelected] = useState<AIModel | undefined>(() => {
    if (value && value.provider && value.model) {
      const found = AVAILABLE_MODELS.find(
        (m) => m.provider === value.provider && m.id === value.model
      );
      return found || DEFAULT_MODEL;
    }
    return undefined;
  });

  // sync controlled value
  useEffect(() => {
    if (value && value.provider && value.model) {
      const found = AVAILABLE_MODELS.find(
        (m) => m.provider === value.provider && m.id === value.model
      );
      if (found) {
        setSelected(found);
      } else {
        // Model not found in list - might be custom model name
        console.log('Model not found:', value, 'Available:', AVAILABLE_MODELS.map(m => `${m.provider}/${m.id}`));
      }
    }
  }, [value?.provider, value?.model]);

  const handleSelect = (model: AIModel) => {
    setSelected(model);
    onChange?.({
      provider: model.provider,
      model: model.id,
    });
  };

  const ProviderIcon = selected ? providerIcons[selected.provider] : FaRobot;

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
            <Icon
              as={ProviderIcon}
              color={selected ? providerColors[selected.provider] : "gray.400"}
            />
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
          <Menu.Content minW="360px" w={"full"} p="2" maxH="400px" overflowY="auto">
            <VStack align="stretch" gap="2">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected =
                  selected?.provider === model.provider &&
                  selected?.id === model.id;
                const ModelIcon = providerIcons[model.provider];

                return (
                  <Menu.Item
                    value={model.id}
                    key={`${model.provider}-${model.id}`}
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
                          <Icon
                            as={ModelIcon}
                            color={providerColors[model.provider]}
                          />
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
