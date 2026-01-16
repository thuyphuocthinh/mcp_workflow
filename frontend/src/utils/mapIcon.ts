import { BiSolidCalculator } from "react-icons/bi";
import { MdEmail } from "react-icons/md";
import { SiGoogle, SiGoogledocs, SiGooglesheets, SiGooglecalendar, SiGoogledrive, SiGoogleslides } from "react-icons/si";

export const mapIcons: Record<string, React.ElementType> = {
    "google_docs": SiGoogledocs,
    "google_sheets": SiGooglesheets,
    "google_search": SiGoogle,
    "gmail": MdEmail,
    "calculator": BiSolidCalculator,
    "google_calendar": SiGooglecalendar,
    "google_slides": SiGoogleslides,
    "google_drive": SiGoogledrive,
}