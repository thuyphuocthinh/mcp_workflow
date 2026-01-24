import DrawerTool from "@/components/tools/DrawerTool";
import { get_list_tools_service } from "@/services";
import { mapIcons } from "@/utils/mapIcon";
import {
  Box,
  SimpleGrid,
  Card,
  Heading,
  Text,
  Flex,
  Icon,
  Center,
  Spinner,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiInbox } from "react-icons/fi";

export default function ToolsPage() {
  const { data: tools, isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: get_list_tools_service,
    retry: false,
  });

  const [open, setOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);

  const handleOpenDrawer = (tool: any) => {
    setSelectedTool(tool);
    setOpen(true);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    setSelectedTool(null);
  };

  return (
    <Box
      p={6}
      minH="100%"
      bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)"
    >
      <Heading size="lg" mb={6} color="white">
        Tools
      </Heading>

      {isLoading ? (
        <Center>
          <Spinner color="purple.400" />
        </Center>
      ) : tools?.data?.length === 0 ? (
        <Center py={20} flexDir="column" color="gray.500">
          <Icon as={FiInbox} boxSize={12} mb={4} />
          <Text fontSize="md" fontWeight="medium">
            No tools available
          </Text>
          <Text fontSize="sm" color="gray.600">
            Tools will appear here when they are added
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {tools?.data?.map((tool) => (
            <Card.Root
              key={tool.id}
              borderRadius="xl"
              bg="rgba(20, 20, 30, 0.8)"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.08)"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              transition="all 0.2s ease"
              _hover={{
                boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                transform: "translateY(-4px)",
                borderColor: "rgba(99, 102, 241, 0.4)",
              }}
              cursor="pointer"
              onClick={() => handleOpenDrawer(tool)}
            >
              <Card.Header>
                <HStack justifyContent={"space-between"}>
                  <Flex align="center" gap={3}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="lg"
                      bg="rgba(99, 102, 241, 0.2)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon
                        as={mapIcons[tool.key]}
                        boxSize={5}
                        color="purple.400"
                      />
                    </Box>
                    <Heading size="sm" color="white">{tool.name}</Heading>
                  </Flex>
                  <Badge
                    bg={tool.is_authorized === false ? "rgba(239, 68, 68, 0.8)" : "rgba(34, 197, 94, 0.8)"}
                    color="white"
                    fontSize="11px"
                    borderRadius="full"
                    px={2}
                  >
                    {tool.is_authorized === false
                      ? "Not connected"
                      : "Connected"}
                  </Badge>
                </HStack>
              </Card.Header>

              <Card.Body>
                <Text fontSize="sm" color="gray.400">
                  {tool.description}
                </Text>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}

      <DrawerTool open={open} onClose={handleCloseDrawer} tool={selectedTool} />
    </Box>
  );
}
