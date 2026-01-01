"use client";

import { type FormEvent, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Field,
  HStack,
} from "@chakra-ui/react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useCustomToast from "@/hooks/useCustomToast";
import { PasswordInput } from "@/components/ui/password-input";
import { regiser_service } from "@/services";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useCustomToast();

  const registerMutation = useMutation({
    mutationFn: regiser_service,

    onSuccess: () => {
      showToast("Success", "Register success. Please login.", "success");
      navigate("/login");
    },

    onError: (err: any) => {
      showToast("Error", err.message || "Something went wrong", "error");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required");
      return;
    }

    setError(null);

    registerMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });
  };

  return (
    <AuthLayout>
      <Flex align="center" justify="center">
        <Box maxW="md" w="full">
          <VStack gap={8} align="stretch">
            <Heading as="h1" size="xl">
              Create Account
            </Heading>
            <Text color="gray.500">Please fill in the information below</Text>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <HStack gap={4}>
                  <Field.Root id="first_name" required>
                    <Field.Label>First name</Field.Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </Field.Root>

                  <Field.Root id="last_name" required>
                    <Field.Label>Last name</Field.Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </Field.Root>
                </HStack>

                <Field.Root id="email" required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@example.com"
                  />
                </Field.Root>

                <Field.Root id="password" required>
                  <Field.Label>Password</Field.Label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                  />
                </Field.Root>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  loading={registerMutation.isPending}
                >
                  Register
                </Button>

                <Text textAlign="center" fontSize="sm" color="gray.600">
                  Already have an account?{" "}
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => navigate("/login")}
                    ml={2}
                  >
                    Login
                  </Button>
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </AuthLayout>
  );
}
