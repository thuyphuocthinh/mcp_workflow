import { Box, Heading, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FaRobot, FaCogs, FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";

const MotionBox = motion(Box);

interface Feature {
    icon: IconType;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: FaRobot,
        title: "AI-Powered Agents",
        description: "Build intelligent agents with access to powerful AI models like GPT and Gemini.",
    },
    {
        icon: FaCogs,
        title: "Visual Workflow Builder",
        description: "Create complex workflows with our intuitive drag-and-drop interface.",
    },
    {
        icon: FaBolt,
        title: "Tool Integration",
        description: "Connect to Google Docs, Sheets, Gmail, and more with built-in MCP tools.",
    },
];

export function FeaturesSection() {
    return (
        <MotionBox
            mt="120px"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <VStack gap={4} mb={12} textAlign="center">
                <Text
                    fontSize="sm"
                    color="purple.400"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                >
                    Features
                </Text>
                <Heading as="h2" size="2xl" color="white">
                    Everything you need
                </Heading>
                <Text color="gray.400" maxW="500px">
                    Build powerful automation workflows with enterprise-grade tools
                </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                {features.map((feature, index) => (
                    <MotionBox
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    >
                        <Box
                            p={8}
                            borderRadius="2xl"
                            bg="rgba(20, 20, 30, 0.6)"
                            backdropFilter="blur(20px)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            _hover={{
                                border: "1px solid rgba(99, 102, 241, 0.4)",
                                transform: "translateY(-4px)",
                                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                            }}
                            transition="all 0.3s"
                            cursor="pointer"
                        >
                            <Box
                                w="60px"
                                h="60px"
                                borderRadius="xl"
                                bg="linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mb={6}
                            >
                                <Icon as={feature.icon} boxSize={6} color="purple.400" />
                            </Box>
                            <Heading as="h3" size="md" color="white" mb={3}>
                                {feature.title}
                            </Heading>
                            <Text color="gray.400" lineHeight="1.7">
                                {feature.description}
                            </Text>
                        </Box>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </MotionBox>
    );
}
