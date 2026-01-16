import { google } from "googleapis";

/**
 * Helper to create Gmail client from access token
 */
export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}
