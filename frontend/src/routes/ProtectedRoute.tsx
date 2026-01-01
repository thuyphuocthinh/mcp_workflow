import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_KEY } from "@/constants";
import { Center, Spinner } from "@chakra-ui/react";
import { get_profile_service } from "@/services/user";

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const { isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: get_profile_service,
    enabled: !!token,
    retry: false,
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (isError) {
    localStorage.removeItem(TOKEN_KEY);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
