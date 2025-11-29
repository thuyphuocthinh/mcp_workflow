"use client";

import { Navbar } from "@/components/common/Navbar";
import { VStack, Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export function ProtectedLayout() {
  return (
    <VStack
      gap="0px"
      height="100vh"
      width="full"
      align="stretch"
      spacing={0} // loại bỏ spacing mặc định của VStack
      flexDirection="column" // cực kỳ quan trọng
    >
      <Navbar balance={30} />
      <Box flex="1" width="full" height="calc(100vh - 72.7px)">
        <Outlet />
      </Box>
    </VStack>
  );
}
