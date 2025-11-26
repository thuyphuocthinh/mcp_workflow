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
} from "@chakra-ui/react";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // validate đơn giản
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setError(null);
    console.log({ email, password });
    // TODO: gọi API login
  };

  return (
    <AuthLayout>
      <Flex align="center" justify="center">
        <Box maxW="md" w="full">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl">
              Welcome Back
            </Heading>
            <Text color="gray.500">Please login to your account</Text>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <Field.Root id="email" required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    placeholder="your@example.com"
                  />
                </Field.Root>

                <Field.Root id="password" required>
                  <Field.Label>Password</Field.Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    placeholder="********"
                  />
                </Field.Root>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}

                <Button type="submit" colorScheme="blue" width="full">
                  Login
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </AuthLayout>
  );
}
