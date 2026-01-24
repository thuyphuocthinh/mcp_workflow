import { TOKEN_KEY } from "@/constants";
import useCustomToast from "@/hooks/useCustomToast";
import { tool_revoke_service } from "@/services";
import type { i_tool } from "@/types";
import {
  Button,
  CloseButton,
  Drawer,
  Portal,
  Text,
  Stack,
  Accordion,
  Box,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DrawerToolProps {
  open: boolean;
  onClose: () => void;
  tool: i_tool | null;
}

const DrawerTool = ({ open, onClose, tool }: DrawerToolProps) => {
  const { showToast } = useCustomToast()
  const queryClient = useQueryClient();
  const handleAuthorize = () => {
    if (!tool) return;
    const token = localStorage.getItem(TOKEN_KEY);
    const baseUrl = import.meta.env.VITE_API_URL;
    const url = `${baseUrl}/tool-auth/google?provider=${encodeURIComponent(
      tool.key
    )}&token=${token}`;
    window.location.href = url;
  };

  const revokeMutation = useMutation({
    mutationFn: (toolKey: string) => tool_revoke_service(toolKey),
    onSuccess: () => {
      showToast(
        "Success",
        "Tool revoked successfully",
        "success",
      );
      queryClient.invalidateQueries({
        queryKey: ["tools"],
      });
      onClose();
    },
    onError: () => {
      showToast(
        "Error",
        "Failed to revoke tool",
        "error",
      );
    },
  });

  const handleRevoke = () => {
    if (!tool) return;
    revokeMutation.mutate(tool.key);
  };

  return (
    <Drawer.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Drawer.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
        <Drawer.Positioner>
          <Drawer.Content
            bg="rgba(20, 20, 30, 0.98)"
            backdropFilter="blur(20px)"
            borderLeft="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <Drawer.Header borderBottom="1px solid rgba(255, 255, 255, 0.08)">
              <Drawer.Title color="white">{tool?.name || "Tool detail"}</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  color="gray.400"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body>
              {!tool ? (
                <Text color="gray.400">No tool selected</Text>
              ) : (
                <Stack gap={4}>
                  {/* Tool info */}
                  <Text fontSize="sm" color="gray.400">
                    {tool.description}
                  </Text>

                  <Stack gap={1}>
                    <Text fontSize="xs" color="gray.500">
                      ID: {tool.id}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Key: {tool.key}
                    </Text>
                  </Stack>

                  {tool.is_authorized === false && (
                    <Button
                      bg="linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)"
                      color="white"
                      onClick={handleAuthorize}
                      _hover={{
                        bg: "linear-gradient(135deg, rgba(34, 197, 94, 1) 0%, rgba(16, 185, 129, 1) 100%)",
                      }}
                    >
                      Authorize
                    </Button>
                  )}

                  {
                    tool.is_authorized === true && (
                      <Button
                        bg="rgba(239, 68, 68, 0.8)"
                        color="white"
                        onClick={handleRevoke}
                        loading={revokeMutation.isPending}
                        _hover={{
                          bg: "rgba(239, 68, 68, 1)",
                        }}
                      >
                        Revoke
                      </Button>
                    )
                  }

                  {/* Tools accordion */}
                  {tool.tools && tool.tools.length > 0 && (
                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        mb={2}
                        color="gray.300"
                      >
                        Available actions
                      </Text>

                      <Accordion.Root multiple={false} collapsible>
                        {tool.tools.map((t) => (
                          <Accordion.Item
                            key={t.name}
                            value={t.name}
                            cursor={"pointer"}
                            borderColor="rgba(255, 255, 255, 0.08)"
                          >
                            <Accordion.ItemTrigger
                              cursor={"pointer"}
                              _hover={{
                                bg: "rgba(99, 102, 241, 0.1)",
                              }}
                            >
                              <Text flex="1" fontSize="sm" fontWeight="medium" color="white">
                                {t.name}
                              </Text>
                              <Accordion.ItemIndicator color="gray.400" />
                            </Accordion.ItemTrigger>

                            <Accordion.ItemContent>
                              <Text fontSize="sm" color="gray.400">
                                {t.description}
                              </Text>
                            </Accordion.ItemContent>
                          </Accordion.Item>
                        ))}
                      </Accordion.Root>
                    </Box>
                  )}
                </Stack>
              )}
            </Drawer.Body>

            <Drawer.Footer borderTop="1px solid rgba(255, 255, 255, 0.08)">
              <Button
                variant="outline"
                onClick={onClose}
                color="gray.400"
                borderColor="rgba(255, 255, 255, 0.1)"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                }}
              >
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default DrawerTool;
