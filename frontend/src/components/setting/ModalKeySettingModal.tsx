"use client";

import {
  Dialog,
  VStack,
  Field,
  Input,
  Button,
  Text,
  HStack,
  Tabs,
  IconButton,
  Portal,
  Box,
  Icon,
} from "@chakra-ui/react";
import { Eye, EyeOff, Trash, Key, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  get_all_key_service,
  upsert_key_service,
  delete_key_service,
} from "@/services/modelKey";
import type { i_model } from "@/constants";
import useCustomToast from "@/hooks/useCustomToast";
import { SiOpenai, SiGooglegemini } from "react-icons/si";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ===== Models ===== */
const MODELS: { label: string; value: i_model; icon: any; color: string }[] = [
  { label: "OpenAI (GPT)", value: "OPENAI", icon: SiOpenai, color: "green.400" },
  { label: "Gemini", value: "GEMINI", icon: SiGooglegemini, color: "blue.400" },
];

export const ModelKeySettingModal = ({ isOpen, onClose }: Props) => {
  const { showToast } = useCustomToast();
  const queryClient = useQueryClient();

  const [activeModel, setActiveModel] = useState<i_model>("OPENAI");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [keyInputs, setKeyInputs] = useState<Record<i_model, string>>({
    OPENAI: "",
    GEMINI: "",
  });

  const [visibleMap, setVisibleMap] = useState<Record<i_model, boolean>>({
    OPENAI: false,
    GEMINI: false,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ================= GET ALL KEYS ================= */
  const { data } = useQuery({
    queryKey: ["model-keys"],
    queryFn: get_all_key_service,
    enabled: isOpen,
  });

  const keys = data?.data ?? [];

  const storedKeyMap = useMemo(() => {
    const map = new Map<i_model, string>();
    keys.forEach((k) => map.set(k.modelType as i_model, k.key));
    return map;
  }, [keys]);

  const hasKeyMap = useMemo(() => {
    const map = new Map<i_model, boolean>();
    keys.forEach((k) => map.set(k.modelType as i_model, true));
    return map;
  }, [keys]);

  /* ================= HELPERS ================= */
  const maskKey = (key: string) => {
    if (key.length < 8) return "****";
    return `${key.slice(0, 3)}****${key.slice(-4)}`;
  };

  const getDisplayValue = (model: i_model) => {
    if (keyInputs[model]) return keyInputs[model];
    const stored = storedKeyMap.get(model);
    if (!stored) return "";
    return visibleMap[model] ? stored : maskKey(stored);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeModel]);

  /* ================= MUTATIONS ================= */
  const upsertMutation = useMutation({
    mutationFn: upsert_key_service,
    onSuccess: () => {
      showToast("Success", "API key saved", "success");
      queryClient.invalidateQueries({ queryKey: ["model-keys"] });
      setKeyInputs((p) => ({ ...p, [activeModel]: "" }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: delete_key_service,
    onSuccess: () => {
      showToast("Success", "API key deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["model-keys"] });
      setConfirmDeleteOpen(false);
      setKeyInputs((p) => ({ ...p, [activeModel]: "" }));
    },
  });

  const handleSave = () => {
    const key = keyInputs[activeModel];
    if (!key) return;

    upsertMutation.mutate({
      modelType: activeModel,
      key,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(activeModel);
  };

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
        <Portal>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              maxW="720px"
              w="100%"
              bg="rgba(20, 20, 30, 0.98)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              boxShadow="0 0 60px rgba(0, 0, 0, 0.5)"
            >
              <Dialog.Header borderBottom="1px solid rgba(255, 255, 255, 0.08)">
                <HStack gap={3}>
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)"
                  >
                    <Icon as={Key} boxSize={5} color="purple.400" />
                  </Box>
                  <VStack align="start" gap={0}>
                    <Dialog.Title color="white">Model API Keys</Dialog.Title>
                    <Text fontSize="xs" color="gray.500">
                      Configure your AI provider credentials
                    </Text>
                  </VStack>
                </HStack>
              </Dialog.Header>

              <Dialog.Body py={6}>
                <Tabs.Root
                  value={activeModel}
                  onValueChange={(e) => setActiveModel(e.value as i_model)}
                  variant="outline"
                >
                  <Tabs.List
                    bg="rgba(255, 255, 255, 0.03)"
                    borderRadius="xl"
                    p={1}
                    borderColor="rgba(255, 255, 255, 0.08)"
                  >
                    {MODELS.map((m) => {
                      const isActive = activeModel === m.value;
                      const exists = hasKeyMap.get(m.value);
                      return (
                        <Tabs.Trigger
                          key={m.value}
                          value={m.value}
                          flex="1"
                          borderRadius="lg"
                          color={isActive ? "white" : "gray.400"}
                          bg={isActive ? "rgba(99, 102, 241, 0.2)" : "transparent"}
                          _hover={{
                            bg: isActive ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.05)",
                          }}
                          transition="all 0.2s"
                        >
                          <HStack gap={2}>
                            <Icon as={m.icon} boxSize={4} color={m.color} />
                            <Text>{m.label}</Text>
                            {exists && (
                              <Box w={2} h={2} borderRadius="full" bg="green.400" />
                            )}
                          </HStack>
                        </Tabs.Trigger>
                      );
                    })}
                  </Tabs.List>

                  {MODELS.map((m) => {
                    const exists = hasKeyMap.get(m.value);

                    return (
                      <Tabs.Content key={m.value} value={m.value}>
                        <VStack pt={6} gap={4} align="stretch">
                          <Field.Root>
                            <Field.Label color="gray.300">
                              <HStack gap={2}>
                                <Text>API Key</Text>
                                {exists && (
                                  <HStack
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    bg="rgba(34, 197, 94, 0.2)"
                                  >
                                    <Icon as={Sparkles} boxSize={3} color="green.400" />
                                    <Text fontSize="xs" color="green.400">
                                      Connected
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                            </Field.Label>

                            <HStack width={"100%"} gap={2}>
                              <Input
                                ref={m.value === activeModel ? inputRef : null}
                                type={visibleMap[m.value] ? "text" : "password"}
                                value={getDisplayValue(m.value)}
                                placeholder="sk-xxxx or AIza..."
                                onChange={(e) =>
                                  setKeyInputs((p) => ({
                                    ...p,
                                    [m.value]: e.target.value,
                                  }))
                                }
                                bg="rgba(255, 255, 255, 0.05)"
                                color="white"
                                borderColor="rgba(255, 255, 255, 0.1)"
                                borderRadius="lg"
                                _placeholder={{ color: "gray.500" }}
                                _hover={{ borderColor: "rgba(99, 102, 241, 0.4)" }}
                                _focus={{
                                  borderColor: "rgba(99, 102, 241, 0.6)",
                                  boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.3)",
                                }}
                              />

                              {exists && (
                                <HStack gap={1}>
                                  <IconButton
                                    aria-label="toggle visibility"
                                    variant="ghost"
                                    size="sm"
                                    color="gray.400"
                                    borderRadius="lg"
                                    onClick={() =>
                                      setVisibleMap((p) => ({
                                        ...p,
                                        [m.value]: !p[m.value],
                                      }))
                                    }
                                    _hover={{
                                      bg: "rgba(255, 255, 255, 0.1)",
                                      color: "white",
                                    }}
                                  >
                                    {visibleMap[m.value] ? (
                                      <EyeOff size={18} />
                                    ) : (
                                      <Eye size={18} />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    aria-label="delete key"
                                    variant={"ghost"}
                                    size="sm"
                                    color="red.400"
                                    borderRadius="lg"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                    _hover={{
                                      bg: "rgba(239, 68, 68, 0.2)",
                                      color: "red.300",
                                    }}
                                  >
                                    <Trash size={18} />
                                  </IconButton>
                                </HStack>
                              )}
                            </HStack>

                            <Text fontSize="xs" color="gray.500" mt={2}>
                              {m.value === "GPT"
                                ? "Get your API key from platform.openai.com"
                                : "Get your API key from makersuite.google.com"}
                            </Text>
                          </Field.Root>
                        </VStack>
                      </Tabs.Content>
                    );
                  })}
                </Tabs.Root>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid rgba(255, 255, 255, 0.08)">
                <HStack w="full" justify="flex-end">
                  <HStack gap={2}>
                    <Button
                      variant="ghost"
                      onClick={onClose}
                      color="gray.400"
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      loading={upsertMutation.isPending}
                      disabled={!keyInputs[activeModel]}
                      bg="linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
                      color="white"
                      _hover={{
                        bg: "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                      }}
                      _disabled={{
                        opacity: 0.5,
                        cursor: "not-allowed",
                      }}
                    >
                      Save Key
                    </Button>
                  </HStack>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* ================= CONFIRM DELETE ================= */}
      <Dialog.Root
        open={confirmDeleteOpen}
        onOpenChange={(e) => !e.open && setConfirmDeleteOpen(false)}
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              maxW="400px"
              bg="rgba(20, 20, 30, 0.98)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="xl"
              boxShadow="0 0 60px rgba(0, 0, 0, 0.5)"
            >
              <Dialog.Header borderBottom="1px solid rgba(255, 255, 255, 0.08)">
                <Dialog.Title color="white">Delete API Key</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="gray.400">
                  Are you sure? This action cannot be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer borderTop="1px solid rgba(255, 255, 255, 0.08)">
                <HStack gap={2}>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDeleteOpen(false)}
                    color="gray.400"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    loading={deleteMutation.isPending}
                    bg="rgba(239, 68, 68, 0.8)"
                    color="white"
                    _hover={{ bg: "rgba(239, 68, 68, 1)" }}
                  >
                    Delete
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
