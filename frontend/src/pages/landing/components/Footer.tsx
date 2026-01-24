import { Box, Container, Flex, HStack, Text } from "@chakra-ui/react";

export function Footer() {
    return (
        <Box
            py={8}
            borderTop="1px solid rgba(255, 255, 255, 0.08)"
            bg="rgba(10, 10, 15, 0.5)"
        >
            <Container maxW="1200px">
                <Flex justify="space-between" align="center">
                    <Text color="gray.500" fontSize="sm">
                        © 2026 Doara Workflow. All rights reserved.
                    </Text>
                    <HStack gap={6}>
                        <Text color="gray.500" fontSize="sm" cursor="pointer" _hover={{ color: "gray.300" }}>
                            Privacy
                        </Text>
                        <Text color="gray.500" fontSize="sm" cursor="pointer" _hover={{ color: "gray.300" }}>
                            Terms
                        </Text>
                    </HStack>
                </Flex>
            </Container>
        </Box>
    );
}
