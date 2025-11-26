"use client";

import { type ReactNode } from "react";
import { Box, Flex, VStack, Heading, Text } from "@chakra-ui/react";
import bg from "@/assets/images/background.png";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, blue.400, purple.500)"
      bgImage={`url(${bg})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
    >
      <Box
        maxW="lg"
        w="full"
        bg="white"
        rounded="2xl"
        shadow="2xl"
        p={{ base: 8, md: 8 }} // padding responsive
        borderWidth={1}
        borderColor="gray.100"
      >
        <VStack spacing={8} align="stretch">
          {title && (
            <Heading as="h1" size="2xl" textAlign="center" color="gray.800">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text textAlign="center" fontSize="lg" color="gray.500">
              {subtitle}
            </Text>
          )}
          <Box>{children}</Box>
        </VStack>
      </Box>
    </Flex>
  );
}
