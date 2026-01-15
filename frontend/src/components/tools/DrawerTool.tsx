import { TOKEN_KEY } from "@/constants";
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

interface DrawerToolProps {
  open: boolean;
  onClose: () => void;
  tool: i_tool | null;
}

const DrawerTool = ({ open, onClose, tool }: DrawerToolProps) => {
  const handleAuthorize = () => {
    if (!tool) return;
    const token = localStorage.getItem(TOKEN_KEY);
    const url = `http://localhost:3000/api/v1/tool-auth/google?provider=${encodeURIComponent(
      tool.key
    )}&token=${token}`;
    window.location.href = url;
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
