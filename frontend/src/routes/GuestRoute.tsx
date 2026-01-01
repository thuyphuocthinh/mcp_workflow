import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get_profile_service } from "@/services/user";
import { TOKEN_KEY } from "@/constants";

export const GuestRoute = () => {
  const token = localStorage.getItem(TOKEN_KEY);

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: get_profile_service,
    enabled: !!token,
    retry: false,
  });

  if (token && isLoading) return null;

  if (me) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
