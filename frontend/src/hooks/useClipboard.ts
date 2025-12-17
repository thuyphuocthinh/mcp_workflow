import { useState, useCallback } from "react";
import useCustomToast from "./useCustomToast";

type ClipboardItem<T> = {
  data: T;
  type: "copy" | "cut";
};

export function useClipboard<T>() {
  const [clipboard, setClipboard] = useState<ClipboardItem<T> | null>(null);
  const { showToast } = useCustomToast();

  // Copy hoặc Cut vào clipboard
  const copy = useCallback((data: T) => {
    setClipboard({ data, type: "copy" });
  }, []);

  const cut = useCallback((data: T, onRemove?: (item: T) => void) => {
    setClipboard({ data, type: "cut" });
    // Nếu là cut, xóa item gốc
    onRemove?.(data);
  }, []);

  // Paste từ clipboard
  const paste = useCallback(
    (onPaste: (item: T) => void) => {
      if (!clipboard) return;
      // Nếu cut, reset clipboard sau khi dán
      onPaste(clipboard.data);
      if (clipboard.type === "cut") setClipboard(null);
      showToast("Success", "Pasted Node Successfully", "success")
    },
    [clipboard]
  );

  // Kiểm tra clipboard hiện tại có dữ liệu không
  const hasData = !!clipboard;

  return {
    clipboard,
    hasData,
    copy,
    cut,
    paste,
    clear: () => setClipboard(null),
  };
}
