import type { Tool } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { FaGoogleDrive, FaGoogle, FaCalculator } from "react-icons/fa";
import { SiGoogledocs, SiGooglesheets } from "react-icons/si";
import { MdEmail, MdCalendarMonth, MdSlideshow } from "react-icons/md";

// Tool keys must match MCP server names in backend (mcp-client.service.ts)
export const tools: Tool[] = [
  {
    id: uuidv4(),
    name: "Calculator",
    key: "calculator",
    description: "Perform mathematical calculations and conversions.",
    icon: FaCalculator,
  },
  {
    id: uuidv4(),
    name: "Gmail",
    key: "gmail",
    description: "Send, receive, and manage your emails efficiently.",
    icon: MdEmail,
  },
  {
    id: uuidv4(),
    name: "Google Docs",
    key: "google-docs",
    description: "Create and edit documents online with real-time collaboration.",
    icon: SiGoogledocs,
  },
  {
    id: uuidv4(),
    name: "Google Sheets",
    key: "google-sheets",
    description: "Analyze data with powerful spreadsheets and formulas.",
    icon: SiGooglesheets,
  },
  {
    id: uuidv4(),
    name: "Google Search",
    key: "google-search",
    description: "Search the world's information instantly.",
    icon: FaGoogle,
  },
  {
    id: uuidv4(),
    name: "Google Calendar",
    key: "google-calendar",
    description: "Schedule events and manage your calendar.",
    icon: MdCalendarMonth,
  },
  {
    id: uuidv4(),
    name: "Google Slides",
    key: "google-slides",
    description: "Create and present beautiful presentations.",
    icon: MdSlideshow,
  },
  {
    id: uuidv4(),
    name: "Google Drive",
    key: "google-drive",
    description: "Store, share, and access files securely in the cloud.",
    icon: FaGoogleDrive,
  },
];
