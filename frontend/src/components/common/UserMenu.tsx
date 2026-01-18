import { Menu, Avatar, HStack, Text, Icon, Portal, Button, Dialog } from "@chakra-ui/react";
import { Settings, LogOut } from "lucide-react";
import { useState } from "react";

interface Props {
  user?: {
    data?: {
      first_name?: string;
      last_name?: string;
    };
  };
  onOpenSettings: () => void;
  handleLogout: () => void;
}

export const UserMenu = ({ user, onOpenSettings, handleLogout }: Props) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const onConfirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  return (
    <>
      <Menu.Root>
        {/* ===== Trigger ===== */}
        <Menu.Trigger asChild>
          <HStack
            gap={2}
            cursor="pointer"
            px={3}
            py={2}
            borderRadius="xl"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            bg="rgba(255, 255, 255, 0.05)"
            _hover={{
              bg: "rgba(99, 102, 241, 0.15)",
              borderColor: "rgba(99, 102, 241, 0.4)",
            }}
            transition="all 0.2s"
          >
            <Text fontSize="sm" fontWeight="medium" color="white">
              {user?.data?.first_name} {user?.data?.last_name}
            </Text>

            <Avatar.Root size="sm">
              <Avatar.Fallback
                name={user?.data?.first_name}
                bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                color="white"
              />
            </Avatar.Root>
          </HStack>
        </Menu.Trigger>

        {/* ===== Dropdown ===== */}
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              minW="180px"
              bg="rgba(20, 20, 30, 0.98)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="xl"
              boxShadow="0 4px 30px rgba(0, 0, 0, 0.5)"
            >
              <Menu.Item
                onClick={onOpenSettings}
                value="settings"
                cursor={"pointer"}
                color="gray.300"
                _hover={{
                  bg: "rgba(99, 102, 241, 0.2)",
                  color: "white",
                }}
              >
                <Icon as={Settings} boxSize={4} />
                <Text ml={2}>Settings</Text>
              </Menu.Item>

              <Menu.Separator borderColor="rgba(255, 255, 255, 0.08)" />

              <Menu.Item
                value="logout"
                color="red.400"
                onClick={() => setShowLogoutConfirm(true)}
                cursor={"pointer"}
                _hover={{
                  bg: "rgba(239, 68, 68, 0.2)",
                  color: "red.300",
                }}
              >
                <Icon as={LogOut} boxSize={4} />
                <Text ml={2}>Logout</Text>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      {/* Logout confirmation dialog */}
      <Dialog.Root
        open={showLogoutConfirm}
        onOpenChange={(e) => setShowLogoutConfirm(e.open)}
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="rgba(20, 20, 30, 0.98)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="xl"
              boxShadow="0 0 60px rgba(0, 0, 0, 0.5)"
            >
              <Dialog.Header borderBottom="1px solid rgba(255, 255, 255, 0.08)">
                <Dialog.Title color="white">Confirm Logout</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="gray.400">
                  Are you sure you want to logout?
                </Text>
              </Dialog.Body>
              <Dialog.Footer borderTop="1px solid rgba(255, 255, 255, 0.08)">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(false)}
                  color="gray.400"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  bg="rgba(239, 68, 68, 0.8)"
                  color="white"
                  onClick={onConfirmLogout}
                  _hover={{
                    bg: "rgba(239, 68, 68, 1)",
                  }}
                >
                  Logout
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
