import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AuthService,
  AuthStatus,
  User,
  login,
  refresh,
} from "../services/AuthService";
import { LoginResponse } from "../shared";
import { AuthContext } from "./AuthContext";
import { generateHash } from "../shared/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = React.useState<User | undefined>(
    localStorage.getItem("emailHash")
      ? { emailHash: localStorage.getItem("emailHash") || "" }
      : undefined,
  );
  const [accessToken, setAccessToken] = React.useState<string | undefined>(
    localStorage.getItem("accessToken")
      ? localStorage.getItem("accessToken")!
      : undefined,
  );
  const [refreshToken, setRefreshToken] = React.useState<string | undefined>(
    localStorage.getItem("refreshToken")
      ? localStorage.getItem("refreshToken")!
      : undefined,
  );

  const handleLogin = async (email: string, password: string) => {
    const tokens = await login(email, password);
    if (!tokens) {
      return new Error("Unable to login");
    }
    handleTokensReceived(email, tokens);
  };

  const handleLogout = () => {
    setUser(undefined);
    setAccessToken(undefined);
    setRefreshToken(undefined);

    // remove the tokens and email hash from local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("emailHash");
  };

  const handleTokenRefresh = async () => {
    if (!refreshToken) {
      console.warn("No refresh token found, cannot refresh access token");
      return;
    }
    const resp = await refresh(refreshToken);
    setAccessToken(resp?.access_token);
    return resp?.access_token;
  };

  let inFlightTokenRefresh: Promise<string | undefined> | undefined = undefined;
  const handleProtectedFetch: <T>(
    token: string | undefined,
    authStatus: AuthStatus,
    method: string,
    path: string,
    body: unknown | null,
    retry: number,
  ) => Promise<T> = async (token, authStatus, method, path, body, retry) => {
    // read application and version from the package.json file
    const application = import.meta.env.VITE_NAME;
    const version = import.meta.env.VITE_VERSION;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": `${application}/${version}`,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}${path}`,
      {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      },
    );
    if (!response || (!response.ok && response.status !== 401)) {
      const err = (await response.json()) as { error?: string };
      if (err.error) {
        throw new Error(err.error);
      } else {
        throw new Error(`Failed to fetch data from ${path}`);
      }
    }

    if (response.status === 401 && authStatus !== AuthStatus.NONE) {
      if (!inFlightTokenRefresh && refreshToken) {
        console.log(`no current token refresh, starting one`);
        inFlightTokenRefresh = handleTokenRefresh();
      } else {
        console.log(`token refresh already in progress, awaiting it`);
      }
      const updatedToken = await inFlightTokenRefresh;
      if (updatedToken && retry < 3) {
        console.log(`retrying ${method} ${path} with new token`);
        return handleProtectedFetch(
          updatedToken,
          authStatus,
          method,
          path,
          body,
          retry + 1,
        );
      } else {
        console.log(`retrying ${method} ${path} with new token failed`);
        throw new Error(
          `Failed to fetch data from ${path} after ${retry} retries`,
        );
      }
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${path}`);
    }
    return response.json();
  };

  const handleFetchData = async <T,>(
    method: string,
    path: string,
    body: unknown | null,
    authStatus: AuthStatus,
  ) => {
    return new Promise<T>((resolve, reject) => {
      if (!accessToken && authStatus === AuthStatus.REQUIRED) {
        reject(new Error("Not logged in"));
        return;
      }
      handleProtectedFetch<T>(accessToken, authStatus, method, path, body, 0)
        .then((data) => resolve(data))
        .catch((e) => reject(e));
    });
  };

  const handleTokensReceived = async (
    email: string,
    response: LoginResponse,
  ) => {
    const emailHash = await generateHash(email);
    // set the user with the email hash
    setUser({ emailHash });
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);

    // store the tokens and email hash in local storage
    localStorage.setItem("accessToken", response.access_token || "");
    localStorage.setItem("refreshToken", response.refresh_token || "");
    localStorage.setItem("emailHash", emailHash);

    const origin = location.state?.from?.pathname || "/";
    navigate(origin);
  };

  useEffect(() => {
    // read the access token from local storage
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const emailHash = localStorage.getItem("emailHash");
    if (accessToken && refreshToken && emailHash) {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser({ emailHash });
    }
  }, []);

  const value: AuthService = {
    user: user,
    tokens: { accessToken, refreshToken },
    onLogin: handleLogin,
    onLogout: handleLogout,
    tokenRefresh: handleTokenRefresh,
    fetchData: handleFetchData,
    onTokenReceived: handleTokensReceived,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
