import { Box, Button, Flex, HStack, Icon, Image, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

interface HeaderProps {
    isLoggedIn: boolean;
}

export function Header({ isLoggedIn }: HeaderProps) {
    const navigate = useNavigate();

    return (
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
            <Image
                src="/doara-logo.png"
                alt="Doara Logo"
                h="40px"
                w="auto"
                objectFit="contain"
                cursor="pointer"
                onClick={() => navigate("/")}
                transition="opacity 0.2s ease"
                _hover={{ opacity: 0.8 }}
            />

            <HStack gap={3}>
                {isLoggedIn ? (
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
    );
}
