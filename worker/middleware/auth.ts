import { IRequest, RequestHandler } from "itty-router";

import { Args } from "..";
import { KVTokenData } from "../durable-objects/user";

export interface User {
  id: string;
  email: string;
  clientId: string;
  name: string;
}

export interface RequestWithUser extends IRequest {
  user: User | undefined;
  headers: Headers;
}

export const withUser: RequestHandler<RequestWithUser, Args> = async (
  request: RequestWithUser,
  env: Env,
) => {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (token) {
    try {
      const accessToken = await env.ACCESS_TOKENS.get<KVTokenData>(
        `access:${token}`,
        { type: "json" },
      );
      if (accessToken) {
        request.user = {
          id: accessToken.userId,
          email: accessToken.email,
          clientId: accessToken.clientId,
          name: accessToken.name,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore
    }
  } else {
    request.user = undefined;
  }
};

export const requireUser = (request: RequestWithUser) => {
  if (!request.user) {
    return new Response("Not Authorized", { status: 401 });
  }
};
