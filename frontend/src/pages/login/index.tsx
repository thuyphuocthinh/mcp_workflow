"use client";

import { type FormEvent, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Field,
  Icon,
} from "@chakra-ui/react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useMutation } from "@tanstack/react-query";
import { login_service } from "@/services";
import { useNavigate } from "react-router-dom";
import useCustomToast from "@/hooks/useCustomToast";
import { TOKEN_KEY } from "@/constants";
import { PasswordInput } from "@/components/ui/password-input";
import { LuMail, LuLock, LuLogIn, LuUserPlus } from "react-icons/lu";

// Validation helpers
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface ValidationErrors {
  email?: string;
  password?: string;
}

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (password.length > 128) {
    return "Password must be less than 128 characters";
  }
  return undefined;
};

// Styled input wrapper
const InputWrapper = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
}) => (
  <Flex
    align="center"
    w="full"
    bg="rgba(255, 255, 255, 0.03)"
    borderWidth={1}
    borderColor="rgba(255, 255, 255, 0.08)"
    rounded="xl"
    px={4}
    py={1}
    transition="all 0.3s ease"
    _focusWithin={{
      borderColor: "rgba(99, 102, 241, 0.5)",
      bg: "rgba(99, 102, 241, 0.05)",
      shadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    }}
    _hover={{
      borderColor: "rgba(255, 255, 255, 0.15)",
    }}
  >
    <Icon as={icon} color="gray.500" boxSize={5} mr={3} />
    {children}
  </Flex>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const navigate = useNavigate();

  const { showToast } = useCustomToast();

  const loginMutation = useMutation({
    mutationFn: login_service,

    onSuccess: (res) => {
      const token = res.data?.token;
      localStorage.setItem(TOKEN_KEY, token as string);
      showToast("Success", "Welcome back! Login successful.", "success");
      navigate("/");
    },

    onError: (err) => {
      showToast("Error", err.message || "Something went wrong", "error");
    },
  });

  // Validate on blur
  const handleBlur = useCallback((field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: field === "email" ? validateEmail(email) : validatePassword(password),
    }));
  }, [email, password]);

  // Real-time validation when touched
  const currentErrors = useMemo(() => {
    return {
      email: touched.email ? validateEmail(email) : undefined,
      password: touched.password ? validatePassword(password) : undefined,
    };
  }, [email, password, touched]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return !validateEmail(email) && !validatePassword(password);
  }, [email, password]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setErrors({});
    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  return (
    <AuthLayout>
      <VStack gap={8} align="stretch">
        {/* Header */}
        <VStack gap={2} align="center">
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "3xl" }}
            bgGradient="linear(to-r, white, gray.300)"
            bgClip="text"
            fontWeight="bold"
            letterSpacing="tight"
          >
            Welcome Back
          </Heading>
          <Text color="gray.500" fontSize="md">
            Sign in to continue to your account
          </Text>
        </VStack>

        {/* Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={5} align="stretch">
            {/* Email Field */}
            <Field.Root id="email" invalid={!!currentErrors.email}>
              <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                Email Address
              </Field.Label>
              <InputWrapper icon={LuMail}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  onBlur={() => handleBlur("email")}
                  placeholder="your@example.com"
                  border="none"
                  bg="transparent"
                  color="white"
                  _placeholder={{ color: "gray.600" }}
                  _focus={{ boxShadow: "none", outline: "none" }}
                  fontSize="md"
                  py={3}
                />
              </InputWrapper>
              {currentErrors.email && (
                <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                  {currentErrors.email}
                </Text>
              )}
            </Field.Root>

            {/* Password Field */}
            <Field.Root id="password" invalid={!!currentErrors.password}>
              <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                Password
              </Field.Label>
              <InputWrapper icon={LuLock}>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder="Enter your password"
                  border="none"
                  bg="transparent"
                  color="white"
                  _placeholder={{ color: "gray.600" }}
                  _focus={{ boxShadow: "none", outline: "none" }}
                  fontSize="md"
                  py={3}
                  flex={1}
                />
              </InputWrapper>
              {currentErrors.password && (
                <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                  {currentErrors.password}
                </Text>
              )}
            </Field.Root>

            {/* Submit Button */}
            <Button
              type="submit"
              width="full"
              size="lg"
              mt={4}
              bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
              color="white"
              fontWeight="semibold"
              rounded="xl"
              py={6}
              transition="all 0.3s ease"
              _hover={{
                bg: "linear-gradient(135deg, #7c7ff2 0%, #9d6ff7 100%)",
                transform: "translateY(-2px)",
                shadow: "0 10px 40px -10px rgba(99, 102, 241, 0.5)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              _disabled={{
                opacity: 0.6,
                cursor: "not-allowed",
                transform: "none",
              }}
              loading={loginMutation.isPending}
              disabled={!isFormValid || loginMutation.isPending}
            >
              <Icon as={LuLogIn} mr={2} />
              Sign In
            </Button>

            {/* Divider */}
            <Flex align="center" gap={4} my={2}>
              <Box flex={1} h="1px" bg="rgba(255, 255, 255, 0.1)" />
              <Text color="gray.600" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                or
              </Text>
              <Box flex={1} h="1px" bg="rgba(255, 255, 255, 0.1)" />
            </Flex>

            {/* Register Link */}
            <Flex justify="center" align="center" gap={2}>
              <Text fontSize="sm" color="gray.500">
                Don't have an account?
              </Text>
              <Button
                variant="ghost"
                size="sm"
                color="purple.400"
                fontWeight="semibold"
                onClick={() => navigate("/register")}
                _hover={{
                  color: "purple.300",
                  bg: "rgba(139, 92, 246, 0.1)",
                }}
                px={3}
              >
                <Icon as={LuUserPlus} mr={1} />
                Create Account
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </AuthLayout>
  );
}
