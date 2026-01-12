import { Menu, Avatar, HStack, Text, Icon } from "@chakra-ui/react";
import { Settings, LogOut } from "lucide-react";

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
  return (
    <Menu.Root>
      {/* ===== Trigger ===== */}
      <Menu.Trigger asChild>
        <HStack
          gap={2}
          cursor="pointer"
          px={2}
          py={1}
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
        >
          <Text fontSize="sm" fontWeight="medium">
            {user?.data?.first_name} {user?.data?.last_name}
          </Text>

          <Avatar.Root size="sm">
            <Avatar.Fallback name={user?.data?.first_name} />
            {/* <Avatar.Image src={user?.avatar_url} /> */}
          </Avatar.Root>
        </HStack>
      </Menu.Trigger>

      {/* ===== Dropdown ===== */}
      <Menu.Positioner>
        <Menu.Content minW="180px">
          <Menu.Item
            onClick={onOpenSettings}
            value="settings"
            cursor={"pointer"}
          >
            <Icon as={Settings} boxSize={4} />
            <Text ml={2}>Settings</Text>
          </Menu.Item>

          <Menu.Separator />

          <Menu.Item
            value="logout"
            color="red.600"
            onClick={handleLogout}
            cursor={"pointer"}
          >
            <Icon as={LogOut} boxSize={4} />
            <Text ml={2}>Logout</Text>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};
