import { google } from "googleapis";

/**
 * Helper to create Google Drive client from access token
 */
export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}
