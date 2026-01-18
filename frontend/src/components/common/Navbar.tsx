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
import { UserMenu } from "./UserMenu";

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
          bg={isActive ? "rgba(99, 102, 241, 0.2)" : "transparent"}
          color={isActive ? "white" : "gray.400"}
          fontWeight={isActive ? "semibold" : "normal"}
          _hover={{
            bg: "rgba(99, 102, 241, 0.15)",
            color: "white",
          }}
          transition="all 0.2s ease"
          borderRadius="lg"
          px={4}
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
      bg="rgba(10, 10, 15, 0.85)"
      backdropFilter="blur(20px)"
      px={6}
      py={isWorkflowDetail ? 5 : 4}
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.08)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.3)"
      width="full"
    >
      <Flex align="center" justify="space-between">
        {/* LEFT */}
        {isWorkflowDetail ? (
          // ===== Workflow detail: breadcrumb =====
          <Breadcrumb.Root gap="8px" fontSize="sm" color="gray.400">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  as={RouterLink}
                  to="/workflows"
                  color="gray.400"
                  _hover={{ color: "purple.400" }}
                  transition="color 0.2s"
                >
                  Home
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator color="gray.600" />
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  as={RouterLink}
                  to={`/workflows/${workflowId}`}
                  color="white"
                >
                  Workflow Detail
                </Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        ) : (
          // ===== Other pages: menu =====
          <HStack gap={2}>
            <NavButton to="/workflows">Workflow</NavButton>
            <NavButton to="/chat">Chat</NavButton>
            <NavButton to="/tools">Tools</NavButton>
          </HStack>
        )}

        {/* RIGHT */}
        {isWorkflowDetail ? (
          // ===== Workflow detail: balance =====
          <HStack
            px={4}
            py={2}
            bg="rgba(99, 102, 241, 0.15)"
            borderRadius="xl"
            gap={2}
            cursor="pointer"
            borderWidth={1}
            borderColor="rgba(99, 102, 241, 0.3)"
            _hover={{
              bg: "rgba(99, 102, 241, 0.25)",
              borderColor: "rgba(99, 102, 241, 0.5)",
            }}
            transition="all 0.2s"
          >
            <WalletIcon w={5} h={5} color="purple.400" />
            <Text fontWeight="semibold" color="white">
              ${balance.toLocaleString()}
            </Text>
          </HStack>
        ) : (
          <UserMenu
            user={user}
            onOpenSettings={onOpen} // mở ModelKeySettingModal
            handleLogout={handleLogout}
          />
        )}
      </Flex>

      <ModelKeySettingModal isOpen={open} onClose={onClose} />
    </Box>
  );
};
