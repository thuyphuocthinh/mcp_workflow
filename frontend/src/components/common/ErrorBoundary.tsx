import React from "react";
import { Box, Button, Heading, Text, VStack, Icon } from "@chakra-ui/react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo });
        // Log error to console or external service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = (): void => {
        window.location.reload();
    };

    handleGoHome = (): void => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    minH="100vh"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)"
                    p={6}
                >
                    <VStack
                        gap={6}
                        maxW="500px"
                        textAlign="center"
                        bg="rgba(20, 20, 30, 0.8)"
                        backdropFilter="blur(20px)"
                        borderRadius="2xl"
                        borderWidth={1}
                        borderColor="rgba(255, 255, 255, 0.1)"
                        p={10}
                        boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
                    >
                        <Box
                            p={4}
                            bg="rgba(239, 68, 68, 0.15)"
                            borderRadius="full"
                        >
                            <Icon as={FiAlertTriangle} boxSize={12} color="red.400" />
                        </Box>

                        <Heading size="lg" color="white" fontWeight="bold">
                            Oops! Something went wrong
                        </Heading>

                        <Text color="gray.400" fontSize="md">
                            We apologize for the inconvenience. An unexpected error has occurred.
                            Please try refreshing the page or go back to the home page.
                        </Text>

                        {import.meta.env.DEV && this.state.error && (
                            <Box
                                w="full"
                                bg="rgba(0, 0, 0, 0.3)"
                                borderRadius="lg"
                                p={4}
                                textAlign="left"
                                maxH="200px"
                                overflowY="auto"
                                css={{
                                    "&::-webkit-scrollbar": {
                                        width: "6px",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        background: "rgba(255, 255, 255, 0.2)",
                                        borderRadius: "3px",
                                    },
                                }}
                            >
                                <Text color="red.300" fontSize="sm" fontFamily="monospace">
                                    {this.state.error.toString()}
                                </Text>
                                {this.state.errorInfo && (
                                    <Text
                                        color="gray.500"
                                        fontSize="xs"
                                        fontFamily="monospace"
                                        mt={2}
                                        whiteSpace="pre-wrap"
                                    >
                                        {this.state.errorInfo.componentStack}
                                    </Text>
                                )}
                            </Box>
                        )}

                        <VStack gap={3} w="full" pt={2}>
                            <Button
                                w="full"
                                bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                                color="white"
                                fontWeight="semibold"
                                borderRadius="xl"
                                py={6}
                                _hover={{
                                    bg: "linear-gradient(135deg, #7c7ff2 0%, #9d6ff7 100%)",
                                    transform: "translateY(-2px)",
                                    shadow: "0 10px 40px -10px rgba(99, 102, 241, 0.5)",
                                }}
                                transition="all 0.3s ease"
                                onClick={this.handleReload}
                            >
                                <Icon as={FiRefreshCw} mr={2} />
                                Refresh Page
                            </Button>

                            <Button
                                w="full"
                                variant="ghost"
                                color="gray.400"
                                fontWeight="medium"
                                borderRadius="xl"
                                py={6}
                                _hover={{
                                    bg: "rgba(255, 255, 255, 0.1)",
                                    color: "white",
                                }}
                                transition="all 0.3s ease"
                                onClick={this.handleGoHome}
                            >
                                Go to Home
                            </Button>
                        </VStack>
                    </VStack>
                </Box>
            );
        }

        return this.props.children;
    }
}
