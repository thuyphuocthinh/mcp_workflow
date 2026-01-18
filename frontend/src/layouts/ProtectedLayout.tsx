"use client";

import { Navbar } from "@/components/common/Navbar";
import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const NAVBAR_HEIGHT = "80px";

export function ProtectedLayout() {
  return (
    <Flex
      direction="column"
      height="100vh"
      width="full"
      bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)"
      position="relative"
    >
      {/* Subtle animated orbs for background */}
      <Box
        position="fixed"
        top="-20%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)"
        filter="blur(80px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="fixed"
        bottom="-30%"
        right="-15%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)"
        filter="blur(100px)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Fixed Navbar */}
      <Box
        as="header"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex={50}
        h={NAVBAR_HEIGHT}
      >
        <Navbar balance={30} />
      </Box>

      {/* Page content - takes remaining height below navbar */}
      <Box
        as="main"
        flex="1"
        mt={NAVBAR_HEIGHT}
        position="relative"
        zIndex={1}
        overflowY="auto"
        minH={`calc(100vh - ${NAVBAR_HEIGHT})`}
        css={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255, 255, 255, 0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(99, 102, 241, 0.3)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(99, 102, 241, 0.5)",
          },
        }}
      >
        <Outlet />
      </Box>
    </Flex>
  );
}
