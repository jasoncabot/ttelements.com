export type UserSignupRequest = {
  email: string;
  client_id: string;
};
export type UserSignupResponse = {};
export type ConfirmUserSignupRequest = {
  email: string;
  code: string;
  password: string;
  client_id: string;
};
