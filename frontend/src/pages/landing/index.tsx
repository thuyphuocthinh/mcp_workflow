import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Icon,
    SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaRobot, FaCogs, FaBolt, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { get_profile_service } from "@/services/user";
import { TOKEN_KEY } from "@/constants";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const features = [
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

export default function LandingPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem(TOKEN_KEY);

    const { data: user } = useQuery({
        queryKey: ["me"],
        queryFn: get_profile_service,
        enabled: !!token,
        retry: false,
    });

    const isLoggedIn = !!user?.data;


    return (
        <Box
            minH="100vh"
            bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)"
            position="relative"
            overflow="hidden"
        >
            {/* Animated background elements */}
            <Box
                position="absolute"
                top="20%"
                left="10%"
                w="300px"
                h="300px"
                borderRadius="full"
                bg="radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)"
                filter="blur(40px)"
                animation="pulse 4s ease-in-out infinite"
            />
            <Box
                position="absolute"
                bottom="20%"
                right="10%"
                w="400px"
                h="400px"
                borderRadius="full"
                bg="radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)"
                filter="blur(60px)"
                animation="pulse 5s ease-in-out infinite"
            />

            {/* Header */}
            <Flex
                as="header"
                position="fixed"
                top={0}
                left={0}
                right={0}
                py={4}
                px={8}
                bg="rgba(10, 10, 15, 0.8)"
                backdropFilter="blur(20px)"
                borderBottom="1px solid rgba(255, 255, 255, 0.08)"
                zIndex={100}
                justify="space-between"
                align="center"
            >
                <HStack gap={3}>
                    <Box
                        p={2}
                        borderRadius="lg"
                        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)"
                    >
                        <Icon as={FaPlay} boxSize={5} color="purple.400" />
                    </Box>
                    <Text fontSize="xl" fontWeight="bold" color="white" letterSpacing="tight">
                        Doara Workflow
                    </Text>
                </HStack>

                <HStack gap={3}>
                    {isLoggedIn ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                color="gray.300"
                                _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.1)" }}
                                onClick={() => navigate("/login")}
                            >
                                Sign In
                            </Button>
                            <Button
                                bg="linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)"
                                color="white"
                                _hover={{
                                    bg: "linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                                    transform: "translateY(-2px)",
                                }}
                                transition="all 0.2s"
                                onClick={() => navigate("/register")}
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </HStack>
            </Flex>

            {/* Hero Section */}
            <Container maxW="1200px" pt="140px" pb="80px">
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

                    {
                        isLoggedIn ? <MotionFlex gap={4}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}>
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
                        </MotionFlex> : <MotionFlex
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
                    }
                </VStack>

                {/* Features Section */}
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
            </Container>

            {/* Footer */}
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

            {/* CSS Animation */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
        </Box>
    );
}
