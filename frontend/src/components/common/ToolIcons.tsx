import type { Tool } from "@/types";
import {
  FaFigma,
  FaGithub,
  FaGoogle,
  FaGoogleDrive,
  FaSlack,
} from "react-icons/fa";
import { MdEmail, MdPictureAsPdf, MdWbSunny } from "react-icons/md";
import { SiGoogledocs, SiGooglesheets, SiNotion } from "react-icons/si";

export type ToolKey =
  | "google_docs"
  | "google_sheets"
  | "google_drive"
  | "gmail"
  | "google_search"
  | "figma"
  | "github"
  | "slack"
  | "notion"
  | "weather"
  | "pdf_viewer";

export const toolIconMap: Record<ToolKey, Tool["icon"]> = {
  google_docs: SiGoogledocs,
  google_sheets: SiGooglesheets,
  google_drive: FaGoogleDrive,
  gmail: MdEmail,
  google_search: FaGoogle,
  figma: FaFigma,
  github: FaGithub,
  slack: FaSlack,
  notion: SiNotion,
  weather: MdWbSunny,
  pdf_viewer: MdPictureAsPdf,
};
