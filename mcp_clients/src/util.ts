import { ToolResult } from "./types";

export const standardize = async <T>(fn: () => Promise<T>): Promise<ToolResult> => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || "Unknown error" };
  }
};
