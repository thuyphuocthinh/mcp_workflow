import { Box, HStack, Text } from "@chakra-ui/react";
import type React from "react";
import type { NodeProps } from "@xyflow/react";
import { NO_ACTION_NODES } from "../../constants";

interface BaseNodeProps extends NodeProps {
  icon?: React.ReactElement;
  colorScheme: string;
  children: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  icon,
  colorScheme,
  children,
}) => {
  const isCut = (data as any).isCut;
  const showMarginoBottom = !NO_ACTION_NODES.includes(
    (data.label as string).toLowerCase()
  );

  return (
    <Box
      padding="10px"
      borderRadius="xl"
      background="white"
      minWidth="200"
      maxWidth="200"
      textAlign="center"
      position="relative"
      boxShadow="lg"
      border={isCut ? "2px dashed red" : "1px solid"}
      borderColor={isCut ? "red.400" : "gray.100"}
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: "xl",
        borderColor: isCut ? "red.500" : "gray.200",
      }}
    >
      <HStack gap={2} mb={showMarginoBottom ? "2" : 0}>
        <Box
          aria-label={data.label}
          colorScheme={colorScheme}
          bg={`${colorScheme}.50`}
          color={`${colorScheme}.500`}
          flexShrink={0}
          transition="all 0.2s"
          _hover={{
            transform: "scale(1.1)",
          }}
          _active={{
            transform: "scale(0.95)",
          }}
          background={`${colorScheme}.200`}
          p={2}
          borderRadius={"sm"}
        >
          {icon}
        </Box>
        <Text
          fontWeight="500"
          fontSize="sm"
          color="gray.700"
          transition="all 0.2s"
          isTruncated
          wordBreak={"break-all"}
          _hover={{
            color: `${colorScheme}.500`,
          }}
        >
          {data.label as string}
        </Text>
      </HStack>
      {children}
    </Box>
  );
};
