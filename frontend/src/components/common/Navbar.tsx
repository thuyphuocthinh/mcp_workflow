"use client";

import {
  Avatar,
  Box,
  Flex,
  Text,
  HStack,
  Breadcrumb,
  chakra,
  Button,
} from "@chakra-ui/react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { LuWallet } from "react-icons/lu";
import { NavLink } from "react-router-dom";

interface NavbarProps {
  balance: number;
}

const WalletIcon = chakra(LuWallet);

interface NavButtonProps {
  to: string;
  children: React.ReactNode;
}

export const NavButton = ({ to, children }: NavButtonProps) => {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          bg={isActive ? "gray.200" : "transparent"}
          fontWeight={isActive ? "semibold" : "normal"}
          _hover={{ bg: "gray.100" }}
          transition="all 0.15s ease"
        >
          {children}
        </Button>
      )}
    </NavLink>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ balance }) => {
  const { pathname } = useLocation();

  // /workflow/:id
  const isWorkflowDetail = /^\/workflows\/[^/]+$/.test(pathname);
  const workflowId = isWorkflowDetail ? pathname.split("/")[2] : null;

  return (
    <Box
      bg="gray.50"
      px={4}
      py={isWorkflowDetail ? 5 : 4}
      borderBottom="1px solid"
      borderColor="gray.300"
      boxShadow="sm"
      width="full"
    >
      <Flex align="center" justify="space-between">
        {/* LEFT */}
        {isWorkflowDetail ? (
          // ===== Workflow detail: breadcrumb =====
          <Breadcrumb.Root gap="8px" fontSize="sm" color="gray.600">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link as={RouterLink} to="/workflows">
                  Home
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  as={RouterLink}
                  to={`/workflows/${workflowId}`}
                >
                  Workflow Detail
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        ) : (
          // ===== Other pages: menu =====
          <HStack gap={6}>
            <NavButton to="/workflows">Workflow</NavButton>
            <NavButton to="/chat">Chat</NavButton>
            <NavButton to="/tools">Tools</NavButton>
          </HStack>
        )}

        {/* RIGHT */}
        {isWorkflowDetail ? (
          // ===== Workflow detail: balance =====
          <HStack
            px={3}
            py={1}
            bg="gray.200"
            borderRadius="md"
            gap={2}
            cursor="pointer"
            _hover={{ bg: "gray.300" }}
          >
            <WalletIcon w={5} h={5} color="gray.700" />
            <Text fontWeight="semibold" color="gray.700">
              ${balance.toLocaleString()}
            </Text>
          </HStack>
        ) : (
          <HStack gap={3}>
            <Text fontSize="sm" fontWeight="medium">
              Thịnh
            </Text>
            <Avatar.Root>
              <Avatar.Fallback name="Segun Adebayo" />
              <Avatar.Image src="https://bit.ly/sage-adebayo" />
            </Avatar.Root>
          </HStack>
        )}
      </Flex>
    </Box>
  );
};
