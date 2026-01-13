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
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Tools
      </Heading>

      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : tools?.data?.length === 0 ? (
        <Center py={20} flexDir="column" color="gray.500">
          <Icon as={FiInbox} boxSize={12} mb={4} />
          <Text fontSize="md" fontWeight="medium">
            No tools available
          </Text>
          <Text fontSize="sm" color="gray.400">
            Tools will appear here when they are added
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {tools?.data?.map((tool) => (
            <Card.Root
              key={tool.id}
              borderRadius="xl"
              boxShadow="sm"
              transition="all 0.2s ease"
              _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
              cursor="pointer"
              onClick={() => handleOpenDrawer(tool)}
            >
              <Card.Header>
                <Flex align="center" gap={3}>
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="md"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      as={mapIcons[tool.key]}
                      boxSize={5}
                      color="gray.700"
                    />
                  </Box>
                  <Heading size="sm">{tool.name}</Heading>
                </Flex>
              </Card.Header>

              <Card.Body>
                <Text fontSize="sm" color="gray.600">
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
