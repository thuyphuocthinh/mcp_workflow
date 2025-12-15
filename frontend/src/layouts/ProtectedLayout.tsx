"use client";

import { Navbar } from "@/components/common/Navbar";
import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const NAVBAR_HEIGHT = "72px";

export function ProtectedLayout() {
  return (
    <Box height="100vh" width="full">
      {/* Fixed Navbar */}
      <Box position="fixed" top="0" left="0" right="0" zIndex="1000">
        <Navbar balance={30} />
      </Box>

      {/* Page content */}
      <Box pt={NAVBAR_HEIGHT} height="100vh" overflow="auto">
        <Outlet />
      </Box>
    </Box>
  );
}
