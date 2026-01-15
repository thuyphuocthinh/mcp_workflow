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
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{tool?.name || "Tool detail"}</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>

            <Drawer.Body>
              {!tool ? (
                <Text>No tool selected</Text>
              ) : (
                <Stack gap={4}>
                  {/* Tool info */}
                  <Text fontSize="sm" color="gray.600">
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
                    <Button colorScheme="green" onClick={handleAuthorize}>
                      Authorize
                    </Button>
                  )}

                  {
                    tool.is_authorized === true && (
                      <Button colorScheme="red" onClick={handleRevoke} loading={revokeMutation.isPending}>
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
                        color="gray.700"
                      >
                        Available actions
                      </Text>

                      <Accordion.Root multiple={false} collapsible>
                        {tool.tools.map((t) => (
                          <Accordion.Item
                            key={t.name}
                            value={t.name}
                            cursor={"pointer"}
                          >
                            <Accordion.ItemTrigger cursor={"pointer"}>
                              <Text flex="1" fontSize="sm" fontWeight="medium">
                                {t.name}
                              </Text>
                              <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>

                            <Accordion.ItemContent>
                              <Text fontSize="sm" color="gray.600">
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

            <Drawer.Footer>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>Save</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default DrawerTool;
