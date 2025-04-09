import { LoginResponse, RefreshTokenResponse } from "../shared";

export type User = {
  emailHash: string;
};

export enum AuthStatus {
  NONE,
  IF_PRESENT,
  REQUIRED,
}

export type AuthService = {
  user: User | undefined;
  tokens: { accessToken: string | undefined; refreshToken: string | undefined };
  onLogin: (username: string, password: string) => Promise<Error | void>;
  onLogout: () => void;
  tokenRefresh: () => Promise<string | undefined>;
  fetchData: <T>(
    method: string,
    path: string,
    body: unknown | undefined,
    authStatus: AuthStatus,
  ) => Promise<T>;
  onTokenReceived: (email: string, response: LoginResponse) => void;
};

export const login = (email: string, password: string) => {
  return fetch(`${import.meta.env.VITE_API_ENDPOINT}/oauth/auth`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "password",
      email: email,
      password: password,
      client_id: import.meta.env.VITE_NAME,
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json() as Promise<LoginResponse | undefined>;
    } else {
      return undefined;
    }
  });
};

export const refresh = (token: string) => {
  return fetch(`${import.meta.env.VITE_API_ENDPOINT}/oauth/token`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: token,
      client_id: import.meta.env.VITE_NAME,
    }),
  }).then((response) => {
    return response.json() as Promise<RefreshTokenResponse | undefined>;
  });
};
