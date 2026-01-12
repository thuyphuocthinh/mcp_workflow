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
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
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
  const [visibleMap, setVisibleMap] = useState<Record<i_model, boolean>>({
    GPT: false,
    GEMINI: false,
  });

  /* active tab */
  const [activeModel, setActiveModel] = useState<i_model>("GPT");

  /* input per model */
  const [keyInputs, setKeyInputs] = useState<Record<i_model, string>>({
    GPT: "",
    GEMINI: "",
  });

  /* ================= GET ALL KEYS ================= */
  const { data } = useQuery({
    queryKey: ["model-keys"],
    queryFn: get_all_key_service,
    enabled: isOpen,
  });

  const keys = data?.data ?? [];

  const storedKeyMap = useMemo(() => {
    const map = new Map<i_model, string>();
    keys.forEach((k) => {
      map.set(k.modelType as i_model, k.key);
    });
    return map;
  }, [keys]);

  const getInputValue = (model: i_model) => {
    if (keyInputs[model]) return keyInputs[model];
    return storedKeyMap.get(model) ?? "";
  };

  /* map existing keys */
  const keyMap = useMemo(() => {
    const map = new Map<i_model, boolean>();
    keys.forEach((k) => map.set(k.modelType as i_model, true));
    return map;
  }, [keys]);

  const hasKey = keyMap.get(activeModel) === true;

  /* ================= UPSERT ================= */
  const upsertMutation = useMutation({
    mutationFn: upsert_key_service,
    onSuccess: () => {
      showToast("Success", "Saved successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["model-keys"] });
      setKeyInputs((prev) => ({ ...prev, [activeModel]: "" }));
    },
    onError: () => {
      showToast("Error", "Failed to save key", "error");
    },
  });

  /* ================= DELETE ================= */
  const deleteMutation = useMutation({
    mutationFn: delete_key_service,
    onSuccess: () => {
      showToast("Success", "Deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["model-keys"] });
      setKeyInputs((prev) => ({ ...prev, [activeModel]: "" }));
    },
    onError: () => {
      showToast("Error", "Failed to delete key", "error");
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
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Model API Keys</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Tabs.Root
              value={activeModel}
              onValueChange={(e) => setActiveModel(e.value as i_model)}
              variant="enclosed"
            >
              <Tabs.List>
                {MODELS.map((m) => (
                  <Tabs.Trigger key={m.value} value={m.value}>
                    {m.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {MODELS.map((m) => {
                const exists = keyMap.get(m.value) === true;

                return (
                  <Tabs.Content key={m.value} value={m.value}>
                    <VStack gap={4} align="stretch" pt={4} w={"100%"}>
                      <Field.Root>
                        <Field.Label>
                          API Key{" "}
                          {exists && (
                            <Text as="span" fontSize="xs" color="green.600">
                              (already saved)
                            </Text>
                          )}
                        </Field.Label>

                        <HStack w={"100%"}>
                          <Input
                            type={visibleMap[m.value] ? "text" : "password"}
                            placeholder={exists ? "Saved API key" : "sk-****"}
                            value={getInputValue(m.value)}
                            onChange={(e) =>
                              setKeyInputs((prev) => ({
                                ...prev,
                                [m.value]: e.target.value,
                              }))
                            }
                          />

                          {exists && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setVisibleMap((prev) => ({
                                  ...prev,
                                  [m.value]: !prev[m.value],
                                }))
                              }
                            >
                              {visibleMap[m.value] ? "Hide" : "Show"}
                            </Button>
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
              {hasKey && (
                <Button
                  colorScheme="red"
                  variant="ghost"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  Delete key
                </Button>
              )}

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
  );
};
