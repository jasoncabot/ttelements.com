import React from "react";
import { AuthService, AuthStatus } from "../services/AuthService";
import { LoginResponse } from "../shared";

export const AuthContext = React.createContext<AuthService>({
  user: undefined,
  tokens: { accessToken: undefined, refreshToken: undefined },
  onLogin: () => {
    return new Promise((_, reject) => {
      reject(new Error("Not implemented"));
    });
  },
  onLogout: () => {
    return new Promise((_, reject) => {
      reject(new Error("Not implemented"));
    });
  },
  tokenRefresh: () => {
    return new Promise((_, reject) => {
      reject(new Error("Not implemented"));
    });
  },
  fetchData: <T>(
    method: string,
    path: string,
    body: unknown | null,
    authStatus: AuthStatus,
  ) => {
    console.log("fetchData", method, path, body, authStatus);
    return new Promise<T>((_, reject) => {
      reject(new Error("Not implemented"));
    });
  },
  onTokenReceived: (email: string, tokens: LoginResponse) => {
    console.log("onTokenReceived", email, tokens);
    return new Promise((_, reject) => {
      reject(new Error("Not implemented"));
    });
  },
});
