import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";

export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const isLoggedIn = false;

  if (isLoggedIn) return <Navigate to="/users" replace />;

  return <>{children}</>;
};
