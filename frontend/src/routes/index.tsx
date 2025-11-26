import Flow from "@/components/workflows/Flow";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "@/pages/login/index";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

export const router = createBrowserRouter([
  {
    path: "workflow",
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Flow />,
      },
    ],
  },
  {
    path: "login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
]);
