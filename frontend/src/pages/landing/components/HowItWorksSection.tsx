import { Box, Flex, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

interface Step {
    step: string;
    title: string;
    description: string;
}

const howItWorks: Step[] = [
    {
        step: "01",
        title: "Design Your Flow",
        description: "Use our visual builder to create your automation workflow with drag-and-drop nodes.",
    },
    {
        step: "02",
        title: "Connect AI & Tools",
        description: "Add AI agents powered by GPT, Gemini, or Claude, and connect to your favorite apps.",
    },
    {
        step: "03",
        title: "Run & Automate",
        description: "Execute your workflow manually or schedule it to run automatically.",
    },
];

export function HowItWorksSection() {
    return (
        <MotionBox
            mt="140px"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <VStack gap={4} mb={16} textAlign="center">
                <Text
                    fontSize="sm"
                    color="purple.400"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                >
                    How it Works
                </Text>
                <Heading as="h2" size="2xl" color="white">
                    Three simple steps
                </Heading>
                <Text color="gray.400" maxW="500px">
                    Get started in minutes with our intuitive workflow builder
                </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                {howItWorks.map((item, index) => (
                    <MotionBox
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                        <VStack align="flex-start" gap={4}>
                            <Flex
                                w="80px"
                                h="80px"
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)"
                                border="1px solid rgba(99, 102, 241, 0.3)"
                                align="center"
                                justify="center"
                                position="relative"
                            >
                                <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    bgGradient="linear(to-r, #6366f1, #8b5cf6)"
                                    bgClip="text"
                                >
                                    {item.step}
                                </Text>
                                {index < 2 && (
                                    <Box
                                        display={{ base: "none", md: "block" }}
                                        position="absolute"
                                        right="-100%"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        w="80%"
                                        h="2px"
                                        bg="linear-gradient(90deg, rgba(99, 102, 241, 0.5) 0%, transparent 100%)"
                                    />
                                )}
                            </Flex>
                            <Heading as="h3" size="md" color="white">
                                {item.title}
                            </Heading>
                            <Text color="gray.400" lineHeight="1.7">
                                {item.description}
                            </Text>
                        </VStack>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </MotionBox>
    );
}
