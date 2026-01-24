import { Box, Container } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { get_profile_service } from "@/services/user";
import { TOKEN_KEY } from "@/constants";
import {
    Header,
    HeroSection,
    FeaturesSection,
    HowItWorksSection,
    IntegrationsSection,
    TestimonialsSection,
    CTASection,
    Footer,
} from "./components";

export default function LandingPage() {
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

            <Header isLoggedIn={isLoggedIn} />

            <Container maxW="1200px" pt="140px" pb="80px">
                <HeroSection isLoggedIn={isLoggedIn} />
                <FeaturesSection />
                <HowItWorksSection />
                <IntegrationsSection />
                <TestimonialsSection />
                <CTASection />
            </Container>

            <Footer />

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
