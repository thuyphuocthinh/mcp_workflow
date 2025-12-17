import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/notfound";
import WorkflowPage from "@/pages/workflow";
import ToolsPage from "@/pages/tools";
import FlowProvider from "@/components/workflows/flow/FlowProvider";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ChatPage from "@/pages/chat";

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="workflows" replace />,
      },
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
