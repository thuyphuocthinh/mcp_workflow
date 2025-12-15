import { createBrowserRouter } from "react-router-dom";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/notfound";
import WorkflowPage from "@/pages/workflow";
import ToolsPage from "@/pages/tools";
import FlowProvider from "@/components/workflows/flow/FlowProvider";

export const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "workflow",
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
        children: [
          {
            index: true,
            element: <ToolsPage />,
          },
        ],
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
