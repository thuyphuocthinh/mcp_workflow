import { toaster } from "@/components/ui/toaster";
import { useCallback } from "react";

const useCustomToast = () => {
  const showToast = useCallback(
    (title: string, description: string, type: "success" | "error") => {
      toaster.remove();
      toaster.create({
        title,
        description,
        type,
        closable: true,
      });
    },
    []
  );

  return { showToast };
};

export default useCustomToast;
