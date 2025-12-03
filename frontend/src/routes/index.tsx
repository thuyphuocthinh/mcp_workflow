import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "@/pages/login/index";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import NotFoundPage from "@/pages/notfound";
import FlowProvider from "@/components/workflows/flow/FlowProvider";

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
        element: <FlowProvider />,
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
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
