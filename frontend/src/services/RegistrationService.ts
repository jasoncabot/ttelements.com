import { LoginResponse, UserSignupResponse } from "@ttelements/shared";

export type RegistrationService = {
  verifyEmail: (email: string) => Promise<Error | void>;
  confirmSignup: (
    email: string,
    password: string,
    code: string
  ) => Promise<Error | void>;
};

export const verifyEmail = (email: string) => {
  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/user_signup`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      client_id: process.env.REACT_APP_NAME,
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
  playerId?: string
) => {
  return fetch(`${process.env.REACT_APP_API_ENDPOINT}/users`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      code: code,
      client_id: process.env.REACT_APP_NAME,
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json() as Promise<LoginResponse | undefined>;
    } else {
      return undefined;
    }
  });
};
