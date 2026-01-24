import { google } from "googleapis";

/**
 * Helper to create Google Calendar client from access token
 */
export function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}
