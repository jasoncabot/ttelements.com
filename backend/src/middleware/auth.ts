import { Request } from 'itty-router';
import { KVTokenData } from '../durable-objects/user';

export interface User {
  id: string;
  email: string;
  clientId: string;
  name: string;
}

export interface RequestWithUser extends Request {
  user: User | undefined;
  headers: Headers;
}

export const withUser = async (request: RequestWithUser, env: Bindings) => {
  const token = request.headers.get('Authorization')?.slice(7); // strip off Bearer

  try {
    const accessToken = await env.ACCESS_TOKENS.get<KVTokenData>(`access:${token}`, { type: 'json' });
    if (accessToken) {
      request.user = {
        id: accessToken.userId,
        email: accessToken.email,
        clientId: accessToken.clientId,
        name: accessToken.name
      };
    }
  } catch (e) {
    // ignore
  }
};

export const requireUser = (request: RequestWithUser) => {
  if (!request.user) {
    return new Response('Not Authorized', { status: 401 });
  }
};
