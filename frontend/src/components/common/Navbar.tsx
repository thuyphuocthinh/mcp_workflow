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
  useDisclosure,
} from "@chakra-ui/react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { LuWallet } from "react-icons/lu";
import { NavLink } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { i_user } from "@/types";
import { TOKEN_KEY } from "@/constants";
import { useNavigate } from "react-router-dom";
import type { i_success_response } from "@/types/base";
import { ModelKeySettingModal } from "@/components/setting/ModalKeySettingModal";

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
  const { open, onOpen, onClose } = useDisclosure();

  const { pathname } = useLocation();

  // /workflow/:id
  const isWorkflowDetail = /^\/workflows\/[^/]+$/.test(pathname);
  const workflowId = isWorkflowDetail ? pathname.split("/")[2] : null;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = queryClient.getQueryData<i_success_response<i_user>>(["me"]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    navigate("/login", { replace: true });
  };

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
              {user?.data?.first_name} {user?.data?.last_name}
            </Text>

            <Avatar.Root cursor="pointer" onClick={onOpen}>
              <Avatar.Fallback name={user?.data?.first_name} />
              {/* <Avatar.Image src={user?.avatar_url} /> */}
            </Avatar.Root>

            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </HStack>
        )}
      </Flex>

      <ModelKeySettingModal isOpen={open} onClose={onClose} />
    </Box>
  );
};
