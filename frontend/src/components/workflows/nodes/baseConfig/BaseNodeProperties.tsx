import {
  VStack,
  HStack,
  Input,
  Select,
  Text,
  Field,
  Portal,
  createListCollection,
  Box,
  Icon,
} from "@chakra-ui/react";
import type { Node } from "@xyflow/react";
import type { ReactNode, ReactElement } from "react";
import { nodeConfig, type INodeConfig } from "./nodeConfig";
import type { VariableReference } from "./variableSystem";

interface BaseNodePropertiesProps {
  node: Node;
  children: ReactNode;
  nodeName: string;
  onNameChange: (newName: string) => void;
  nameError: string | null;
  icon: ReactElement;
  colorScheme: string;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

export const BaseNodeProperties = ({
  node,
  children,
  nodeName,
  onNameChange,
  nameError,
  icon,
  colorScheme,
  onNodeDataChange,
  availableVariables,
}: BaseNodePropertiesProps) => {
  const nodeType = node.type as INodeConfig;
  const inputVariables = nodeConfig[nodeType]?.inputVariables ?? [];
  const variableCollection = createListCollection({
    items: availableVariables.map((v) => ({
      label: `${v.nodeId}.${v.variableName}`,
      value: `\${${v.nodeId}.${v.variableName}}`,
    })),
  });

  return (
    <VStack gap={4} align="stretch" p={4}>
      {/* ===== Node name ===== */}
      <Field.Root invalid={!!nameError} w={"full"}>
        <HStack gap={2} mb={1} w={"full"}>
          <Box
            aria-label="node-icon"
            bg={`${colorScheme}.500`}
            color="white"
            transition="all 0.2s"
            _active={{ transform: "scale(0.95)" }}
            _hover={{
              transform: "scale(1.1)",
            }}
            p={2}
            borderRadius={"lg"}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </Box>

          <Input
            value={nodeName}
            onChange={(e) => {
              e.stopPropagation();
              const value = e.target.value.trim();
              onNameChange(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                e.stopPropagation();
              }
            }}
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (!value) {
                onNameChange(nodeName);
              }
            }}
            placeholder="Enter node name"
            size="sm"
            fontWeight="500"
            flex="1"
            bg="rgba(255, 255, 255, 0.05)"
            color="white"
            borderRadius="lg"
            borderColor="rgba(255, 255, 255, 0.1)"
            transition="all 0.2s"
            _placeholder={{ color: "gray.500" }}
            _hover={{ borderColor: "rgba(99, 102, 241, 0.4)" }}
            _focus={{
              borderColor: "rgba(99, 102, 241, 0.6)",
              boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.3)",
              bg: "rgba(99, 102, 241, 0.1)",
            }}
          />
        </HStack>

        <Field.ErrorText color="red.400">
          {nameError || "Node Name is required"}
        </Field.ErrorText>
      </Field.Root>

      {/* ===== Input variables ===== */}
      {inputVariables.map((varName) => (
        <Field.Root key={varName}>
          <Text fontWeight="bold" color="gray.300" mb={1} fontSize="sm">
            {varName}:
          </Text>

          <Select.Root
            size="sm"
            collection={variableCollection}
            onValueChange={(details) => {
              onNodeDataChange(node.id, varName, details.value[0] ?? "");
            }}
          >
            <Select.HiddenSelect />

            <Select.Control
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              borderColor="rgba(255, 255, 255, 0.1)"
              transition="all 0.2s"
              _hover={{ borderColor: "rgba(99, 102, 241, 0.4)" }}
              _focusWithin={{
                borderColor: "rgba(99, 102, 241, 0.6)",
                boxShadow: "0 0 0 1px rgba(99, 102, 241, 0.3)",
              }}
            >
              <Select.Trigger color="gray.300">
                <Select.ValueText placeholder="Select a variable" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator color="gray.400" />
              </Select.IndicatorGroup>
            </Select.Control>

            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="rgba(20, 20, 30, 0.98)"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(20px)"
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.5)"
                >
                  {variableCollection.items.map((item) => (
                    <Select.Item
                      item={item}
                      key={item.value}
                      color="gray.300"
                      _hover={{
                        bg: "rgba(99, 102, 241, 0.2)",
                        color: "white",
                      }}
                    >
                      {item.label}
                      <Select.ItemIndicator color="purple.400" />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Field.Root>
      ))}

      {children}
    </VStack>
  );
};
