import {
  VStack,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  Field,
  Portal,
  createListCollection,
  Box,
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
        <HStack gap={1} mb={1} w={"80%"}>
          <Box
            aria-label="node-icon"
            colorScheme={colorScheme}
            bg={`${colorScheme}.50`}
            color={`${colorScheme}.500`}
            transition="all 0.2s"
            _active={{ transform: "scale(0.95)" }}
            _hover={{
              transform: "scale(1.1)",
            }}
            background={`${colorScheme}.200`}
            p={2}
            borderRadius={"sm"}
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
            placeholder="请输入节点名称"
            size="sm"
            fontWeight="500"
            w="75%"
            bg="white"
            borderRadius="lg"
            borderColor="gray.200"
            transition="all 0.2s"
            _hover={{ borderColor: `${colorScheme}.200` }}
            _focus={{
              borderColor: `${colorScheme}.500`,
              boxShadow: `0 0 0 1px var(--chakra-colors-${colorScheme}-500)`,
            }}
          />
        </HStack>

        <Field.ErrorText>
          {nameError || "Node Name is required"}
        </Field.ErrorText>
      </Field.Root>

      {/* ===== Input variables ===== */}
      {inputVariables.map((varName) => (
        <Field.Root key={varName}>
          <Text fontWeight="bold" color="gray.700" mb={1}>
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
              bg="ui.inputbgcolor"
              borderRadius="lg"
              borderColor="gray.200"
              transition="all 0.2s"
              _hover={{ borderColor: `${colorScheme}.200` }}
              _focusWithin={{
                borderColor: `${colorScheme}.500`,
                boxShadow: `0 0 0 1px var(--chakra-colors-${colorScheme}-500)`,
              }}
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Select a variable" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>

            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {variableCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
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
