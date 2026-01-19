import { Box, Button, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaCheck, FaPlay } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export function CTASection() {
    const navigate = useNavigate();

    return (
        <MotionBox
            mt="140px"
            mb="80px"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <Box
                p={{ base: 10, md: 16 }}
                borderRadius="3xl"
                bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)"
                border="1px solid rgba(99, 102, 241, 0.3)"
                textAlign="center"
                position="relative"
                overflow="hidden"
            >
                <Box
                    position="absolute"
                    top="-50%"
                    left="-10%"
                    w="400px"
                    h="400px"
                    borderRadius="full"
                    bg="radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)"
                    filter="blur(60px)"
                />
                <Box
                    position="absolute"
                    bottom="-50%"
                    right="-10%"
                    w="400px"
                    h="400px"
                    borderRadius="full"
                    bg="radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)"
                    filter="blur(60px)"
                />
                <VStack gap={6} position="relative" zIndex={1}>
                    <Heading as="h2" size="2xl" color="white">
                        Ready to automate your workflows?
                    </Heading>
                    <Text color="gray.300" fontSize="lg" maxW="600px">
                        Join thousands of teams already using Doara to build intelligent AI-powered automations.
                    </Text>
                    <HStack gap={4} mt={4}>
                        <Button
                            size="lg"
                            bg="white"
                            color="gray.900"
                            px={8}
                            py={7}
                            fontSize="lg"
                            fontWeight="bold"
                            _hover={{
                                transform: "translateY(-2px)",
                                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)",
                            }}
                            transition="all 0.3s"
                            onClick={() => navigate("/register")}
                        >
                            <HStack gap={2}>
                                <Text>Get Started Free</Text>
                                <Icon as={FaArrowRight} />
                            </HStack>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            color="white"
                            borderColor="rgba(255, 255, 255, 0.3)"
                            px={8}
                            py={7}
                            fontSize="lg"
                            _hover={{
                                bg: "rgba(255, 255, 255, 0.1)",
                                borderColor: "white",
                            }}
                            transition="all 0.3s"
                        >
                            <HStack gap={2}>
                                <Icon as={FaPlay} />
                                <Text>Watch Demo</Text>
                            </HStack>
                        </Button>
                    </HStack>
                    <HStack gap={6} mt={4} color="gray.400" fontSize="sm">
                        <HStack gap={2}>
                            <Icon as={FaCheck} color="green.400" />
                            <Text>Free forever plan</Text>
                        </HStack>
                        <HStack gap={2}>
                            <Icon as={FaCheck} color="green.400" />
                            <Text>No credit card required</Text>
                        </HStack>
                        <HStack gap={2}>
                            <Icon as={FaCheck} color="green.400" />
                            <Text>Cancel anytime</Text>
                        </HStack>
                    </HStack>
                </VStack>
            </Box>
        </MotionBox>
    );
}
