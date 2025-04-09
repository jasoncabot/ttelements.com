import { LoginResponse, UserSignupResponse } from "../shared";

export type RegistrationService = {
  verifyEmail: (email: string) => Promise<Error | void>;
  confirmSignup: (
    email: string,
    password: string,
    code: string,
  ) => Promise<Error | void>;
};

export const verifyEmail = (email: string) => {
  return fetch(`${import.meta.env.VITE_API_ENDPOINT}/user_signup`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      client_id: import.meta.env.VITE_NAME,
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json() as Promise<UserSignupResponse | undefined>;
    } else {
      return undefined;
    }
  });
};

export const confirmSignup = (
  email: string,
  password: string,
  code: string,
  playerId?: string,
) => {
  return fetch(`${import.meta.env.VITE_API_ENDPOINT}/users`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      code: code,
      player_id: playerId,
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
