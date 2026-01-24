import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/assets/styles/index.css";
import { Provider } from "@/components/ui/provider";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index.tsx";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider forcedTheme="light">
          <RouterProvider router={router} />
          <Toaster />
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
