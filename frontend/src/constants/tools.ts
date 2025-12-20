import type { Tool } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { FaGoogleDrive, FaGoogle } from "react-icons/fa";
import { SiGoogledocs, SiGooglesheets } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { FaFigma, FaGithub, FaSlack } from "react-icons/fa";
import { SiNotion } from "react-icons/si";
import { MdPictureAsPdf, MdWbSunny } from "react-icons/md";

export const tools: Tool[] = [
  {
    id: uuidv4(),
    name: "Google Docs",
    key: "google_docs",
    description:
      "Create and edit documents online with real-time collaboration.",
    icon: SiGoogledocs,
  },
  {
    id: uuidv4(),
    name: "Google Sheets",
    key: "google_sheets",
    description: "Analyze data with powerful spreadsheets and formulas.",
    icon: SiGooglesheets,
  },
  {
    id: uuidv4(),
    name: "Google Drive",
    key: "google_drive",
    description: "Store, share, and access files securely in the cloud.",
    icon: FaGoogleDrive,
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
    name: "Google Search",
    key: "google_search",
    description: "Search the world’s information instantly.",
    icon: FaGoogle,
  },
  {
    id: uuidv4(),
    name: "Figma",
    key: "figma",
    description: "Design, prototype, and collaborate on UI/UX in real time.",
    icon: FaFigma,
  },
  {
    id: uuidv4(),
    name: "GitHub",
    key: "github",
    description: "Host, review, and manage code repositories.",
    icon: FaGithub,
  },
  {
    id: uuidv4(),
    name: "Slack",
    key: "slack",
    description: "Communicate with your team through organized channels.",
    icon: FaSlack,
  },
  {
    id: uuidv4(),
    name: "Notion",
    key: "notion",
    description: "Organize docs, tasks, and knowledge in one workspace.",
    icon: SiNotion,
  },
  {
    id: uuidv4(),
    name: "Weather",
    key: "weather",
    description: "Check real-time weather forecasts and conditions.",
    icon: MdWbSunny,
  },
  {
    id: uuidv4(),
    key: "pdf_viewer",
    name: "PDF Viewer",
    description: "View, manage, and export PDF documents easily.",
    icon: MdPictureAsPdf,
  },
];
