export { main as startCalculator } from "./calculator/index.js";
export { main as startGmail } from "./gmail/index.js";
export { main as startGoogleDocs } from "./google_docs/index.js";
export { main as startGoogleSearch } from "./google_search/index.js";
export { main as startGoogleSheets } from "./google_sheets/index.js";
export { main as startGoogleCalendar } from "./google_calendar/index.js";
export { main as startGoogleSlides } from "./google_slides/index.js";
export { main as startGoogleDrive } from "./google_drive/index.js";

/**
 * All provider start functions
 */
export const providers = [
  { name: "calculator", start: () => import("./calculator/index.js").then((m) => m.main()) },
  { name: "gmail", start: () => import("./gmail/index.js").then((m) => m.main()) },
  { name: "google-docs", start: () => import("./google_docs/index.js").then((m) => m.main()) },
  { name: "google-search", start: () => import("./google_search/index.js").then((m) => m.main()) },
  { name: "google-sheets", start: () => import("./google_sheets/index.js").then((m) => m.main()) },
  { name: "google-calendar", start: () => import("./google_calendar/index.js").then((m) => m.main()) },
  { name: "google-slides", start: () => import("./google_slides/index.js").then((m) => m.main()) },
  { name: "google-drive", start: () => import("./google_drive/index.js").then((m) => m.main()) },
];
