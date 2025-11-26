import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  return children;
};
