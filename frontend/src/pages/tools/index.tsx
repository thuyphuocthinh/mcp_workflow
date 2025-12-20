import { tools } from "@/constants/tools";
import {
  Box,
  SimpleGrid,
  Card,
  Heading,
  Text,
  Flex,
  Icon,
} from "@chakra-ui/react";

export default function ToolsPage() {
  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Tools
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {tools.map((tool) => (
          <Card.Root
            key={tool.id}
            borderRadius="xl"
            boxShadow="sm"
            transition="all 0.2s ease"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
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
                  <Icon as={tool.icon} boxSize={5} color="gray.700" />
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
    </Box>
  );
}
