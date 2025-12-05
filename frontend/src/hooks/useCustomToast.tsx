import { toaster } from "@/components/ui/toaster";
import { useCallback } from "react";

const useCustomToast = () => {
  const showToast = useCallback(
    (title: string, description: string, type: "success" | "error") => {
      toaster.create({
        title,
        description,
        type,
      });
    },
    []
  );

  return showToast;
};

export default useCustomToast;
