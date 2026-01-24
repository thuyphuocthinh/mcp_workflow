"use client";

import { type ReactNode } from "react";
import { Box, Flex, VStack, Heading, Text } from "@chakra-ui/react";

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
      position="relative"
      overflow="hidden"
      bg="black"
    >
      {/* Animated gradient background */}
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)"
        opacity={0.9}
        zIndex={0}
      />

      {/* Subtle animated orbs */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)"
        filter="blur(60px)"
        animation="pulse 8s ease-in-out infinite"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-30%"
        right="-15%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)"
        filter="blur(80px)"
        animation="pulse 10s ease-in-out infinite reverse"
        zIndex={0}
      />

      {/* Main card with glassmorphism */}
      <Box
        position="relative"
        zIndex={1}
        maxW="lg"
        w="full"
        mx={4}
        bg="rgba(20, 20, 30, 0.85)"
        backdropFilter="blur(20px)"
        rounded="3xl"
        shadow="0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)"
        p={{ base: 8, md: 10 }}
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.08)"
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          rounded: "3xl",
          padding: "1px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(99,102,241,0.1) 100%)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          pointerEvents: "none",
        }}
      >
        <VStack gap={6} align="stretch">
          {title && (
            <Heading
              as="h1"
              size="2xl"
              textAlign="center"
              bgGradient="linear(to-r, white, gray.300)"
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
            >
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text textAlign="center" fontSize="lg" color="gray.400">
              {subtitle}
            </Text>
          )}
          <Box>{children}</Box>
        </VStack>
      </Box>

      {/* CSS Animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </Flex>
  );
}
