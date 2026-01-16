import type { Tool } from "@/types";
import {
  FaFigma,
  FaGithub,
  FaGoogle,
  FaGoogleDrive,
  FaSlack,
  FaCalculator,
} from "react-icons/fa";
import { MdEmail, MdPictureAsPdf, MdWbSunny, MdCalendarMonth, MdSlideshow } from "react-icons/md";
import { SiGoogledocs, SiGooglesheets, SiNotion } from "react-icons/si";
import { FiTool } from "react-icons/fi";

// Keys must match tools.ts keys (hyphen format for MCP server names)
export type ToolKey =
  | "calculator"
  | "gmail"
  | "google-docs"
  | "google-sheets"
  | "google-drive"
  | "google-search"
  | "google-calendar"
  | "google-slides"
  | "figma"
  | "github"
  | "slack"
  | "notion"
  | "weather"
  | "pdf_viewer";

export const toolIconMap: Record<ToolKey, Tool["icon"]> = {
  calculator: FaCalculator,
  gmail: MdEmail,
  "google-docs": SiGoogledocs,
  "google-sheets": SiGooglesheets,
  "google-drive": FaGoogleDrive,
  "google-search": FaGoogle,
  "google-calendar": MdCalendarMonth,
  "google-slides": MdSlideshow,
  figma: FaFigma,
  github: FaGithub,
  slack: FaSlack,
  notion: SiNotion,
  weather: MdWbSunny,
  pdf_viewer: MdPictureAsPdf,
};

// Fallback icon for unknown tools
export const getToolIcon = (key: string): Tool["icon"] => {
  return toolIconMap[key as ToolKey] || FiTool;
};
