import { Avatar, Box, Heading, HStack, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

interface Testimonial {
    name: string;
    role: string;
    company: string;
    avatar: string;
    content: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        name: "Sarah Chen",
        role: "Product Manager",
        company: "TechCorp",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        content: "This platform has completely transformed how we handle automated workflows. The visual builder is intuitive and the AI integration is seamless.",
        rating: 5,
    },
    {
        name: "Marcus Johnson",
        role: "Developer",
        company: "StartupXYZ",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        content: "Finally, a tool that lets me build AI agents without writing complex code. The MCP protocol integration is a game-changer.",
        rating: 5,
    },
    {
        name: "Emily Rodriguez",
        role: "Operations Lead",
        company: "Enterprise Inc",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        content: "We've automated 80% of our repetitive tasks using Doara. The ROI has been incredible.",
        rating: 5,
    },
];

export function TestimonialsSection() {
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
                    Testimonials
                </Text>
                <Heading as="h2" size="2xl" color="white">
                    Loved by teams worldwide
                </Heading>
                <Text color="gray.400" maxW="500px">
                    See what our users are saying about their experience
                </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                {testimonials.map((testimonial, index) => (
                    <MotionBox
                        key={testimonial.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                        <Box
                            p={8}
                            borderRadius="2xl"
                            bg="rgba(20, 20, 30, 0.6)"
                            backdropFilter="blur(20px)"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            h="100%"
                            position="relative"
                        >
                            <Icon
                                as={FaQuoteLeft}
                                position="absolute"
                                top={4}
                                right={4}
                                boxSize={8}
                                color="rgba(99, 102, 241, 0.2)"
                            />
                            <HStack gap={1} mb={4}>
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Icon key={i} as={FaStar} color="yellow.400" boxSize={4} />
                                ))}
                            </HStack>
                            <Text color="gray.300" lineHeight="1.8" mb={6}>
                                "{testimonial.content}"
                            </Text>
                            <HStack gap={4}>
                                <Avatar.Root>
                                    <Avatar.Image src={testimonial.avatar} />
                                    <Avatar.Fallback>{testimonial.name}</Avatar.Fallback>
                                </Avatar.Root>
                                <VStack align="flex-start" gap={0}>
                                    <Text color="white" fontWeight="semibold">
                                        {testimonial.name}
                                    </Text>
                                    <Text color="gray.500" fontSize="sm">
                                        {testimonial.role} at {testimonial.company}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </MotionBox>
                ))}
            </SimpleGrid>
        </MotionBox>
    );
}
