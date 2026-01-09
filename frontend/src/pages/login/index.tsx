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
import { useMutation } from "@tanstack/react-query";
import { login_service } from "@/services";
import { useNavigate } from "react-router-dom";
import useCustomToast from "@/hooks/useCustomToast";
import { TOKEN_KEY } from "@/constants";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { showToast } = useCustomToast();

  const loginMutation = useMutation({
    mutationFn: login_service,

    onSuccess: (res) => {
      const token = res.data?.token;
      localStorage.setItem(TOKEN_KEY, token as string);
      showToast("Success", "Login Success", "success");
      navigate("/");
    },

    onError: (err) => {
      showToast("Error", err.message || "Something went wrong", "error");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setError(null);
    loginMutation.mutate({
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
              Welcome Back
            </Heading>
            <Text color="gray.500">Please login to your account</Text>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
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
                  loading={loginMutation.isPending}
                >
                  Login
                </Button>

                <Text textAlign="center" fontSize="sm" color="gray.600">
                  Don’t have an account?{" "}
                  <Button
                    variant={"outline"}
                    colorScheme="blue"
                    onClick={() => navigate("/register")}
                    ml={2}
                  >
                    Register
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
