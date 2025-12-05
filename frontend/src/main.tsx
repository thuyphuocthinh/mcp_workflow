import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/assets/styles/index.css";
import { Provider } from "@/components/ui/provider";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index.tsx";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider forcedTheme="light">
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  </StrictMode>
);
