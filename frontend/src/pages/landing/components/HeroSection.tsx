import { Box, Button, Flex, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaBolt, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface HeroSectionProps {
    isLoggedIn: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
    const navigate = useNavigate();

    return (
        <VStack gap={8} textAlign="center">
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <HStack
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg="rgba(99, 102, 241, 0.15)"
                    border="1px solid rgba(99, 102, 241, 0.3)"
                    mb={4}
                    justify="center"
                >
                    <Icon as={FaBolt} color="purple.400" boxSize={4} />
                    <Text fontSize="sm" color="purple.300" fontWeight="medium">
                        Powered by MCP Protocol
                    </Text>
                </HStack>

                <Heading
                    as="h1"
                    size="4xl"
                    color="white"
                    fontWeight="bold"
                    lineHeight="1.1"
                    mb={6}
                >
                    Build Intelligent
                    <br />
                    <Text
                        as="span"
                        bgGradient="linear(to-r, #6366f1, #8b5cf6, #a855f7)"
                        bgClip="text"
                    >
                        AI Workflows
                    </Text>
                </Heading>

                <Text
                    fontSize="xl"
                    color="gray.400"
                    maxW="600px"
                    mx="auto"
                    lineHeight="1.8"
                >
                    Create, automate, and deploy AI-powered workflows with visual tools.
                    Connect to powerful AI models and integrate with your favorite apps.
                </Text>
            </MotionBox>

            {isLoggedIn ? (
                <MotionFlex
                    gap={4}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Button
                        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
                        color="white"
                        _hover={{
                            bg: "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                            transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s"
                        onClick={() => navigate("/workflows")}
                    >
                        <HStack gap={2}>
                            <Text>Go to Dashboard</Text>
                            <Icon as={FaArrowRight} />
                        </HStack>
                    </Button>
                </MotionFlex>
            ) : (
                <MotionFlex
                    gap={4}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Button
                        size="lg"
                        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
                        color="white"
                        px={8}
                        py={7}
                        fontSize="lg"
                        _hover={{
                            bg: "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
                        }}
                        transition="all 0.3s"
                        onClick={() => navigate("/register")}
                    >
                        <HStack gap={2}>
                            <Text>Start Building</Text>
                            <Icon as={FaArrowRight} />
                        </HStack>
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        color="gray.300"
                        borderColor="rgba(255, 255, 255, 0.2)"
                        px={8}
                        py={7}
                        fontSize="lg"
                        _hover={{
                            bg: "rgba(255, 255, 255, 0.05)",
                            borderColor: "rgba(255, 255, 255, 0.4)",
                            color: "white",
                        }}
                        transition="all 0.3s"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </Button>
                </MotionFlex>
            )}
        </VStack>
    );
}
