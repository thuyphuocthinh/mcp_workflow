import { Box, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { FaGoogle, FaSlack, FaGithub } from "react-icons/fa";
import { SiOpenai, SiNotion } from "react-icons/si";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";

const MotionBox = motion(Box);

interface Integration {
    name: string;
    icon: IconType;
    color: string;
}

const integrations: Integration[] = [
    { name: "Google", icon: FaGoogle, color: "#4285F4" },
    { name: "OpenAI", icon: SiOpenai, color: "#10a37f" },
    { name: "Slack", icon: FaSlack, color: "#4A154B" },
    { name: "GitHub", icon: FaGithub, color: "#ffffff" },
    { name: "Notion", icon: SiNotion, color: "#ffffff" },
];

export function IntegrationsSection() {
    return (
        <MotionBox
            mt="140px"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <VStack gap={4} mb={12} textAlign="center">
                <Text
                    fontSize="sm"
                    color="purple.400"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                >
                    Integrations
                </Text>
                <Heading as="h2" size="2xl" color="white">
                    Connect your favorite tools
                </Heading>
                <Text color="gray.400" maxW="500px">
                    Seamlessly integrate with the apps and services you already use
                </Text>
            </VStack>

            <Flex justify="center" wrap="wrap" gap={8}>
                {integrations.map((integration, index) => (
                    <MotionBox
                        key={integration.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <VStack
                            p={6}
                            borderRadius="2xl"
                            bg="rgba(20, 20, 30, 0.6)"
                            backdropFilter="blur(20px)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            minW="120px"
                            _hover={{
                                border: "1px solid rgba(99, 102, 241, 0.4)",
                                transform: "translateY(-4px)",
                            }}
                            transition="all 0.3s"
                            cursor="pointer"
                        >
                            <Icon as={integration.icon} boxSize={10} color={integration.color} />
                            <Text color="gray.300" fontSize="sm" fontWeight="medium">
                                {integration.name}
                            </Text>
                        </VStack>
                    </MotionBox>
                ))}
            </Flex>
        </MotionBox>
    );
}
