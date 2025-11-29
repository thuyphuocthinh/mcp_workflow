"use client";

import {
  Breadcrumb,
  BreadcrumbSeparator,
  Box,
  Flex,
  Text,
  HStack,
  chakra,
} from "@chakra-ui/react";
import { LuWallet } from "react-icons/lu";

interface NavbarProps {
  balance: number;
}

const WalletIcon = chakra(LuWallet);

export const Navbar: React.FC<NavbarProps> = ({ balance }) => {
  return (
    <Box
      bg="gray.50"
      px={4}
      py={5}
      borderBottom="1px solid"
      borderColor="gray.300"
      boxShadow="sm"
      width="full"
    >
      <Flex align="center" justify="space-between">
        {/* Breadcrumb bên trái */}
        <Breadcrumb.Root spacing="8px" fontSize="sm" color="gray.600">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Dashboard</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item isCurrentPage>
              <Breadcrumb.Link href="#">Workflow</Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>

        {/* Bên phải: balance */}
        <HStack spacing={4}>
          <HStack
            px={3}
            py={1}
            bg="gray.200"
            borderRadius="md"
            spacing={2}
            cursor="pointer"
            _hover={{ bg: "gray.300" }}
          >
            <WalletIcon w={5} h={5} color="gray.700" />
            <Text fontWeight="semibold" color="gray.700">
              ${balance.toLocaleString()}
            </Text>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
};
