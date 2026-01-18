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
  HStack,
} from "@chakra-ui/react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useCustomToast from "@/hooks/useCustomToast";
import { PasswordInput } from "@/components/ui/password-input";
import { regiser_service } from "@/services";
import { LuMail, LuLock, LuUserPlus, LuLogIn, LuUser } from "react-icons/lu";

// Validation helpers
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ỹ\s'-]{2,50}$/;

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface TouchedFields {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

const validateFirstName = (name: string): string | undefined => {
  if (!name.trim()) {
    return "First name is required";
  }
  if (name.trim().length < 2) {
    return "First name must be at least 2 characters";
  }
  if (!NAME_REGEX.test(name.trim())) {
    return "First name contains invalid characters";
  }
  return undefined;
};

const validateLastName = (name: string): string | undefined => {
  if (!name.trim()) {
    return "Last name is required";
  }
  if (name.trim().length < 2) {
    return "Last name must be at least 2 characters";
  }
  if (!NAME_REGEX.test(name.trim())) {
    return "Last name contains invalid characters";
  }
  return undefined;
};

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

const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
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

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<TouchedFields>({});

  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  const registerMutation = useMutation({
    mutationFn: regiser_service,

    onSuccess: () => {
      showToast("Success", "Account created successfully! Please login.", "success");
      navigate("/login");
    },

    onError: (err: any) => {
      showToast("Error", err.message || "Something went wrong", "error");
    },
  });

  // Validate on blur
  const handleBlur = useCallback((field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Real-time validation when touched
  const currentErrors = useMemo((): ValidationErrors => {
    return {
      firstName: touched.firstName ? validateFirstName(firstName) : undefined,
      lastName: touched.lastName ? validateLastName(lastName) : undefined,
      email: touched.email ? validateEmail(email) : undefined,
      password: touched.password ? validatePassword(password) : undefined,
      confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword) : undefined,
    };
  }, [firstName, lastName, email, password, confirmPassword, touched]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      !validateFirstName(firstName) &&
      !validateLastName(lastName) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validateConfirmPassword(password, confirmPassword)
    );
  }, [firstName, lastName, email, password, confirmPassword]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    if (!isFormValid) {
      return;
    }

    registerMutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <AuthLayout>
      <VStack gap={6} align="stretch">
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
            Create Account
          </Heading>
          <Text color="gray.500" fontSize="md">
            Join us and start your journey
          </Text>
        </VStack>

        {/* Form */}
        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch">
            {/* Name Fields Row */}
            <HStack gap={4} align="flex-start">
              {/* First Name */}
              <Field.Root id="firstName" invalid={!!currentErrors.firstName} flex={1}>
                <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                  First Name
                </Field.Label>
                <InputWrapper icon={LuUser}>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="John"
                    border="none"
                    bg="transparent"
                    color="white"
                    _placeholder={{ color: "gray.600" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                    fontSize="md"
                    py={3}
                  />
                </InputWrapper>
                {currentErrors.firstName && (
                  <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                    {currentErrors.firstName}
                  </Text>
                )}
              </Field.Root>

              {/* Last Name */}
              <Field.Root id="lastName" invalid={!!currentErrors.lastName} flex={1}>
                <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                  Last Name
                </Field.Label>
                <InputWrapper icon={LuUser}>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Doe"
                    border="none"
                    bg="transparent"
                    color="white"
                    _placeholder={{ color: "gray.600" }}
                    _focus={{ boxShadow: "none", outline: "none" }}
                    fontSize="md"
                    py={3}
                  />
                </InputWrapper>
                {currentErrors.lastName && (
                  <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                    {currentErrors.lastName}
                  </Text>
                )}
              </Field.Root>
            </HStack>

            {/* Email Field */}
            <Field.Root id="email" invalid={!!currentErrors.email}>
              <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                Email Address
              </Field.Label>
              <InputWrapper icon={LuMail}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password Field */}
            <Field.Root id="confirmPassword" invalid={!!currentErrors.confirmPassword}>
              <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                Confirm Password
              </Field.Label>
              <InputWrapper icon={LuLock}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="Re-enter your password"
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
              {currentErrors.confirmPassword && (
                <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                  {currentErrors.confirmPassword}
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
              loading={registerMutation.isPending}
              disabled={!isFormValid || registerMutation.isPending}
            >
              <Icon as={LuUserPlus} mr={2} />
              Create Account
            </Button>

            {/* Divider */}
            <Flex align="center" gap={4} my={2}>
              <Box flex={1} h="1px" bg="rgba(255, 255, 255, 0.1)" />
              <Text color="gray.600" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                or
              </Text>
              <Box flex={1} h="1px" bg="rgba(255, 255, 255, 0.1)" />
            </Flex>

            {/* Login Link */}
            <Flex justify="center" align="center" gap={2}>
              <Text fontSize="sm" color="gray.500">
                Already have an account?
              </Text>
              <Button
                variant="ghost"
                size="sm"
                color="purple.400"
                fontWeight="semibold"
                onClick={() => navigate("/login")}
                _hover={{
                  color: "purple.300",
                  bg: "rgba(139, 92, 246, 0.1)",
                }}
                px={3}
              >
                <Icon as={LuLogIn} mr={1} />
                Sign In
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </AuthLayout>
  );
}
