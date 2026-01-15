// google.scopes.ts

// Base scopes required by passport-google-oauth20 to fetch user profile
const BASE_SCOPES = [
  'profile',
  'email',
];

export const GOOGLE_PROVIDER_SCOPES = {
  google_docs: [
    ...BASE_SCOPES,
    'https://www.googleapis.com/auth/documents',
  ],
  google_sheets: [
    ...BASE_SCOPES,
    'https://www.googleapis.com/auth/spreadsheets',
  ],
  gmail: [
    ...BASE_SCOPES,
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
};

