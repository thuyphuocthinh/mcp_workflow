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
} from "@chakra-ui/react";
import { Eye, EyeOff, Trash } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  get_all_key_service,
  upsert_key_service,
  delete_key_service,
} from "@/services/modelKey";
import type { i_model } from "@/constants";
import useCustomToast from "@/hooks/useCustomToast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ===== Models ===== */
const MODELS: { label: string; value: i_model }[] = [
  { label: "OpenAI (GPT)", value: "GPT" },
  { label: "Gemini", value: "GEMINI" },
];

export const ModelKeySettingModal = ({ isOpen, onClose }: Props) => {
  const { showToast } = useCustomToast();
  const queryClient = useQueryClient();

  const [activeModel, setActiveModel] = useState<i_model>("GPT");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [keyInputs, setKeyInputs] = useState<Record<i_model, string>>({
    GPT: "",
    GEMINI: "",
  });

  const [visibleMap, setVisibleMap] = useState<Record<i_model, boolean>>({
    GPT: false,
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
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="720px" w="100%">
            <Dialog.Header>
              <Dialog.Title>Model API Keys</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Tabs.Root
                value={activeModel}
                onValueChange={(e) => setActiveModel(e.value as i_model)}
                variant="outline"
              >
                <Tabs.List>
                  {MODELS.map((m) => (
                    <Tabs.Trigger key={m.value} value={m.value} flex="1">
                      {m.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {MODELS.map((m) => {
                  const exists = hasKeyMap.get(m.value);

                  return (
                    <Tabs.Content key={m.value} value={m.value}>
                      <VStack pt={6} gap={4} align="stretch">
                        <Field.Root>
                          <Field.Label>
                            API Key{" "}
                            {exists && (
                              <Text as="span" fontSize="xs" color="green.500">
                                (saved)
                              </Text>
                            )}
                          </Field.Label>

                          <HStack width={"100%"}>
                            <Input
                              ref={m.value === activeModel ? inputRef : null}
                              type={visibleMap[m.value] ? "text" : "password"}
                              value={getDisplayValue(m.value)}
                              placeholder="sk-xxxx"
                              onChange={(e) =>
                                setKeyInputs((p) => ({
                                  ...p,
                                  [m.value]: e.target.value,
                                }))
                              }
                            />

                            {exists && (
                              <HStack gap={2}>
                                <IconButton
                                  aria-label="toggle visibility"
                                  variant="ghost"
                                  onClick={() =>
                                    setVisibleMap((p) => ({
                                      ...p,
                                      [m.value]: !p[m.value],
                                    }))
                                  }
                                >
                                  {visibleMap[m.value] ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </IconButton>
                                <IconButton
                                  variant={"ghost"}
                                  onClick={() => setConfirmDeleteOpen(true)}
                                >
                                  <Trash size={18} color="red" />
                                </IconButton>
                              </HStack>
                            )}
                          </HStack>
                        </Field.Root>
                      </VStack>
                    </Tabs.Content>
                  );
                })}
              </Tabs.Root>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack w="full" justify="flex-end">
                <HStack>
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    loading={upsertMutation.isPending}
                    disabled={!keyInputs[activeModel]}
                  >
                    Save
                  </Button>
                </HStack>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* ================= CONFIRM DELETE ================= */}
      <Dialog.Root
        open={confirmDeleteOpen}
        onOpenChange={(e) => !e.open && setConfirmDeleteOpen(false)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="400px">
            <Dialog.Header>
              <Dialog.Title>Delete API Key</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Are you sure? This action cannot be undone.
            </Dialog.Body>
            <Dialog.Footer>
              <HStack>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                  bg="red.500"
                  _hover={{ bg: "red.600" }}
                >
                  Delete
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};
