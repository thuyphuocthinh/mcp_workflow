import { google } from "googleapis";

/**
 * Helper to create Google Slides client from access token
 */
export function getSlidesClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.slides({ version: "v1", auth });
}
