import { GuestRoute } from "./GuestRoute";
import LoginPage from "@/pages/login/index";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
]);
