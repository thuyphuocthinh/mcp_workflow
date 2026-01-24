import fs from "node:fs/promises";
import path from "node:path";
import type { Sheet } from "../../../core/types.js";

const DATA_PATH = path.join(process.cwd(), "./sheets.json");

/**
 * Read sheets from JSON file
 */
export async function readSheets(): Promise<Sheet[]> {
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(data) as Sheet[];
  } catch {
    return [];
  }
}

/**
 * Write sheets to JSON file
 */
export async function writeSheets(sheets: Sheet[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(sheets, null, 2));
}
