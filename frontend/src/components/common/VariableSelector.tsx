"use client";

import { Box, Textarea, VStack, Text, Portal } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VariableReference } from "../workflows/nodes/baseConfig/variableSystem";
import debounce from "lodash/debounce";

type VariableSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
  availableVariables: VariableReference[];
  placeholder?: string;
  label?: string;
};

export function VariableSelector({
  value = "",
  label,
  onChange,
  availableVariables,
  placeholder = "Type text, use @ to reference variables...",
}: VariableSelectorProps) {
  const [text, setText] = useState(value);
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ================== Sync controlled ================== */
  useEffect(() => {
    setText(value);
  }, [value]);

  /* ================== Helpers ================== */

  const updateCaretPosition = () => {
    const el = textareaRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });
  };

  const processMention = useCallback((val: string, cursor: number) => {
    const beforeCursor = val.slice(0, cursor);
    const match = beforeCursor.match(/@([\w.]*)$/);

    if (match) {
      setQuery(match[1]);
      setShowMenu(true);
      updateCaretPosition();
    } else {
      setShowMenu(false);
      setQuery("");
    }
  }, []);

  const debouncedProcessMention = useMemo(
    () => debounce(processMention, 200),
    [processMention]
  );

  // Debounce onChange để tránh re-render parent component liên tục
  const debouncedOnChange = useMemo(
    () =>
      debounce((val: string) => {
        onChange?.(val);
      }, 300),
    [onChange]
  );

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      debouncedProcessMention.cancel();
      debouncedOnChange.cancel();
    };
  }, [debouncedProcessMention, debouncedOnChange]);

  const handleChange = (val: string) => {
    // Update local state immediately for responsive UI
    setText(val);

    // Debounce parent callback to prevent lag
    debouncedOnChange(val);

    const cursor = textareaRef.current?.selectionStart ?? 0;

    // debounce logic nặng
    debouncedProcessMention(val, cursor);
  };

  const handleSelectVariable = (variable: VariableReference) => {
    const el = textareaRef.current;
    if (!el) return;

    const cursor = el.selectionStart;
    const before = text.slice(0, cursor).replace(/@([\w.]*)$/, "");
    const after = text.slice(cursor);

    const inserted = `${before}{{${variable.nodeId}}}${after}`;
    setText(inserted);
    onChange?.(inserted);

    setShowMenu(false);
    setQuery("");

    requestAnimationFrame(() => {
      el.focus();
    });
  };

  /* ================== Filter ================== */

  const filtered = availableVariables?.filter((v) =>
    v.nodeId.toLowerCase().includes(query.toLowerCase())
  );

  /* ================== Render ================== */

  return (
    <Box position="relative">
      <VStack align="stretch" gap="2">
        {label && (
          <Text fontSize="sm" fontWeight="600" color="gray.300">
            {label}
          </Text>
        )}

        <Box position="relative">
          <Textarea
            ref={textareaRef}
            value={text}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            resize="vertical"
            minH="120px"
            bg="rgba(255, 255, 255, 0.05)"
            color="white"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="lg"
            _placeholder={{ color: "gray.500" }}
            _hover={{ borderColor: "rgba(99, 102, 241, 0.4)" }}
            _focus={{
              borderColor: "rgba(99, 102, 241, 0.6)",
              boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.3)",
              bg: "rgba(99, 102, 241, 0.05)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                e.stopPropagation();
              }
            }}
          />

          {/* menu variables giữ nguyên */}
        </Box>
      </VStack>

      {showMenu && filtered.length > 0 && (
        <Portal>
          <Box
            position="absolute"
            top={`${position.top}px`}
            left={`${position.left}px`}
            w="320px"
            bg="rgba(20, 20, 30, 0.98)"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="lg"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.5)"
            zIndex={1000}
            p="2"
          >
            <VStack align="stretch" gap="1">
              {filtered.map((variable) => (
                <Box
                  key={variable.nodeId}
                  px="3"
                  py="2"
                  borderRadius="md"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: "rgba(99, 102, 241, 0.2)",
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // tránh mất focus textarea
                    handleSelectVariable(variable);
                  }}
                >
                  <Text fontSize="sm" fontWeight="medium" color="white">
                    @{variable.nodeId}
                  </Text>
                  {variable.variableName && (
                    <Text fontSize="xs" color="gray.500">
                      {variable.variableName}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        </Portal>
      )}
    </Box>
  );
}
