import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/notfound";
import WorkflowPage from "@/pages/workflow";
import ToolsPage from "@/pages/tools";
import FlowProvider from "@/components/workflows/flow/FlowProvider";
import { createBrowserRouter } from "react-router-dom";
import ChatPage from "@/pages/chat";
import RegisterPage from "@/pages/register";
import LandingPage from "@/pages/landing";

export const router = createBrowserRouter([
  // Landing page for guests
  {
    path: "/",
    element: <LandingPage />,
  },
  // Protected routes
  {
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "workflows",
        children: [
          {
            index: true,
            element: <WorkflowPage />,
          },
          {
            path: ":id",
            element: <FlowProvider />,
          },
        ],
      },
      {
        path: "tools",
        element: <ToolsPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
    ],
  },
  // Guest routes (login, register)
  {
    element: <GuestRoute />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
