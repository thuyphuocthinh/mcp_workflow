import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const isLoggedIn = true;

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
};
