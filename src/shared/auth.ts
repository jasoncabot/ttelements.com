import { sha256 } from "js-sha256";

export type LoginRequest = {
  grant_type: string;
  email: string;
  password: string;
  client_id: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
};

export type RefreshTokenRequest = {
  grant_type: string;
  refresh_token: string;
  client_id: string;
};

export type RefreshTokenResponse = {
  access_token: string;
  expires_at: string;
  token_type: string;
};

export const generateHash = async (email: string): Promise<string> => {
  const cleanedEmail = email.trim().toLowerCase();
  return sha256(cleanedEmail);
};
