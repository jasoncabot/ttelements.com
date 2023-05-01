import { ConfirmUserSignupRequest, LoginRequest, RefreshTokenRequest, UserSignupRequest } from '@ttelements/shared';
import { createCors } from 'itty-cors';
import { Request, Router } from 'itty-router';
import { error, json, missing, status } from 'itty-router-extras';

import { listOwnedCardsAction, resetUserCardsAction } from './durable-objects/card-collection';
import {
  TokenEntry,
  chooseCardsInGameAction,
  createGameAction,
  joinGameAction,
  listGameAction,
  listOpenGameAction,
  openSocketGameAction,
  playCardInGameAction,
  showGameAction,
  tradeCardsInGameAction
} from './durable-objects/game';
import { confirmSignupAction, createSignupAction, loginAction, purchaseAction, refreshTokenAction, userDetailsAction } from './durable-objects/user';
import { RequestWithUser, requireUser, withUser } from './middleware';
import { md5 } from './middleware/hash';

const { preflight, corsify } = createCors({
  methods: ['GET', 'POST'],
  origins: ['http://localhost:3000', 'http://mac.lan:3000', 'http://0.0.0.0:3000', 'https://ttelements.com'],
  maxAge: 3600,
  headers: {}
});

export interface VersionResponse {
  version: string;
}

const router = Router();

router
  .all('*', preflight)
  .get('/version', () => json({ version: '0.1.0' } as VersionResponse))
  // Start the user registration flow by sending an email a unique code
  .post('/user_signup', async (request: Request, env: Bindings) => {
    try {
      const body = await request.json!();
      const email = (body as UserSignupRequest).email;

      // get the object for this user
      const id = env.USER.idFromName(`e:${email}`);
      const obj = env.USER.get(id);

      // create a sign up action for them
      return obj.fetch(createSignupAction(), {
        method: 'POST',
        body: JSON.stringify(body)
      });
    } catch (err) {
      return status(400, 'Invalid request');
    }
  })
  // Complete user registration
  .post('/users', async (request: Request, env: Bindings) => {
    try {
      const body = await request.json!();
      const email = (body as ConfirmUserSignupRequest).email;

      // get the object for this user
      const id = env.USER.idFromName(`e:${email}`);
      const obj = env.USER.get(id);

      // confirm the sign up action for them
      return obj.fetch(confirmSignupAction(), {
        method: 'POST',
        body: JSON.stringify(body)
      });
    } catch (err) {
      return status(400, 'Invalid request');
    }
  })
  // Login
  .post('/oauth/auth', async (request: Request, env: Bindings) => {
    try {
      const body = await request.json!();
      const email = (body as LoginRequest).email;

      // get the object for this user
      const id = env.USER.idFromName(`e:${email}`);
      const obj = env.USER.get(id);

      // confirm the sign up action for them
      return obj.fetch(loginAction(), {
        method: 'POST',
        body: JSON.stringify(body)
      });
    } catch (err) {
      return status(400, 'Invalid request');
    }
  })
  // Refresh token
  .post('/oauth/token', async (request: Request, env: Bindings) => {
    try {
      const body = await request.json!();
      const token = (body as RefreshTokenRequest).refresh_token;

      // get the object for this user
      const id = env.USER.idFromName(`refresh_token:${token}`);
      const obj = env.USER.get(id);

      // confirm the sign up action for them
      return obj.fetch(refreshTokenAction(), {
        method: 'POST',
        body: JSON.stringify(body)
      });
    } catch (err) {
      return status(400, 'Invalid request');
    }
  })
  // List news
  .get('/news', async (request: Request, env: Bindings) => {
    return json(
      [
        {
          id: 1,
          title: 'This is a news item',
          description: "This is the first news item. It's a bit boring, but it's a start."
        }
      ],
      { status: 200 }
    );
  })
  // Create a new deck of cards
  .post('/starter_pack', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    try {
      const id = env.CARD_COLLECTION.idFromName('global');
      const obj = env.CARD_COLLECTION.get(id);

      return obj.fetch(resetUserCardsAction(request.user!.id), {
        method: 'POST'
      });
    } catch (err) {
      console.log(err);
      return status(400, 'Invalid request');
    }
  })
  // Get all cards that the current user has
  .get('/cards', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    try {
      const id = env.CARD_COLLECTION.idFromName('global');
      const obj = env.CARD_COLLECTION.get(id);

      return obj.fetch(listOwnedCardsAction(request.user!.id), {
        method: 'POST'
      });
    } catch (err) {
      console.log(err);
      return status(400, 'Invalid request');
    }
  })
  .get('/user/details', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    try {
      // get the object for this user
      const id = env.USER.idFromName(`e:${request.user!.email}`);
      const obj = env.USER.get(id);

      return obj.fetch(userDetailsAction(), {
        method: 'POST'
      });
    } catch (err) {
      console.log(err);
      return status(400, 'Invalid request');
    }
  })
  .post('/purchase', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    try {
      const body = await request.text!();

      // get the object for this user
      const id = env.USER.idFromName(`e:${request.user!.email}`);
      const obj = env.USER.get(id);

      return obj.fetch(purchaseAction(), {
        method: 'POST',
        body: body
      });
    } catch (err) {
      console.log(err);
      return status(400, 'Invalid request');
    }
  })
  // Find in-progress games
  .get('/games', withUser, async (request: RequestWithUser, env: Bindings) => {
    const id = env.GAME.idFromName('global');
    const obj = env.GAME.get(id);

    if (request.user) {
      // find all games for this user and return them with current status
      return obj.fetch(listGameAction(request.user.id));
    } else {
      // find all games that are in state WaitingForPlayers and return them
      const id = env.GAME.idFromName('global');
      const obj = env.GAME.get(id);

      return obj.fetch(listOpenGameAction());
    }
  })
  .get('/waiting-games', withUser, async (request: RequestWithUser, env: Bindings) => {
    // find all games that are in state WaitingForPlayers and return them
    const id = env.GAME.idFromName('global');
    const obj = env.GAME.get(id);

    return await obj.fetch(listOpenGameAction());
  })
  // Create a game
  .post('/games', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    try {
      const createRequest = await request.text!();

      const id = env.GAME.idFromName('global');
      const obj = env.GAME.get(id);

      const hashedEmail = await md5(request.user!.email.toLowerCase().trim());

      const created = (await obj
        .fetch(createGameAction(request.user!.id, request.user!.name, hashedEmail), {
          method: 'POST',
          body: createRequest
        })
        .then((resp) => resp.json())) as any;

      return json(created, { status: 201 });
    } catch (err) {
      console.log(err);
      return status(400, 'Invalid request');
    }
  })
  // Show details about a game
  .get('/games/:id', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;

    const id = env.GAME.idFromName(gameId);
    const obj = env.GAME.get(id);

    return await obj.fetch(showGameAction(request.user!.id));
  })
  // Joins this game as another player
  .post('/games/:id/player', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;
    const joinRequest = await request.text!();

    const id = env.GAME.idFromName(gameId);
    const obj = env.GAME.get(id);

    const hashedEmail = await md5(request.user!.email.toLowerCase().trim());

    const joinResponse = obj.fetch(joinGameAction(request.user!.id, request.user!.name, hashedEmail), {
      method: 'POST',
      body: joinRequest
    });
    const result = await joinResponse;
    return result;
  })
  // play a card in a game
  .post('/games/:id/action', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;
    const gameActionRequest = await request.text!();

    const id = env.GAME.idFromName(gameId);
    const obj = env.GAME.get(id);

    return await obj.fetch(playCardInGameAction(request.user!.id), {
      method: 'POST',
      body: gameActionRequest
    });
  })
  // Choose cards in a game
  .post('/games/:id/cards', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;
    const gameActionRequest = await request.text!();

    const id = env.GAME.idFromName(gameId);
    const obj = env.GAME.get(id);

    return await obj.fetch(chooseCardsInGameAction(request.user!.id), {
      method: 'POST',
      body: gameActionRequest
    });
  })
  // Select traded cards in a game
  .post('/games/:id/trades', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;
    const gameActionRequest = await request.text!();

    const id = env.GAME.idFromName(gameId);
    const obj = env.GAME.get(id);

    return await obj.fetch(tradeCardsInGameAction(request.user!.id), {
      method: 'POST',
      body: gameActionRequest
    });
  })

  // Create a websocket token we can use later to connect to this game
  .post('/games/:id/ws', withUser, requireUser, async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;
    // use web crypto to generate secure uuid
    const token = crypto.randomUUID();
    const hashedEmail = await md5(request.user!.email.toLowerCase().trim());
    const socketToken: TokenEntry = {
      userId: request.user!.id,
      userName: request.user!.name,
      emailHash: hashedEmail,
      gameId: gameId
    };
    await env.SOCKET_TOKENS.put(token, JSON.stringify(socketToken), { expirationTtl: 60 * 60 * 24 });
    return json({ token }, { status: 201 });
  })
  // Connect to the websocket - we can't set headers here so use a temporary token instead
  .get('/games/:id/ws', async (request: RequestWithUser, env: Bindings) => {
    const gameId = (request.params || {}).id;
    const token = (request.query || {}).token;
    if (!token) return status(400, 'invalid token');

    const id = env.GAME.idFromName(gameId);
    const obj = env.GAME.get(id);
    return obj.fetch(openSocketGameAction(token), {
      headers: {
        Upgrade: 'websocket'
      }
    });
  })
  .all('*', () => missing('route not found'));

const worker: ExportedHandler<Bindings> = {
  fetch: (...args) =>
    router
      .handle(...args)
      .catch((err) => error(500, err.stack))
      .then(corsify)
};

export * from './durable-objects';

export const handleRequest = worker.fetch;

export default worker;
