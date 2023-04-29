import {
  CardEdition,
  CardKinds,
  ConfirmUserSignupRequest,
  LoginRequest,
  LoginResponse,
  PurchaseRequest,
  PurchaseResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdateCardCollectionRequest,
  UserDetailsResponse,
  UserSignupRequest,
  ViewableCardResponse
} from '@ttelements/shared';
import { status } from 'itty-router-extras';
import { resetUserCardsAction, updateCardsAction } from './card-collection';

export const createSignupAction = () => `${durableObjectGameAction('signup')}`;
export const confirmSignupAction = () => `${durableObjectGameAction('confirm')}`;
export const loginAction = () => `${durableObjectGameAction('login')}`;
export const refreshTokenAction = () => `${durableObjectGameAction('refresh')}`;
export const userDetailsAction = () => `${durableObjectGameAction('details')}`;
export const purchaseAction = () => `${durableObjectGameAction('purchase')}`;

const durableObjectGameAction = (type: UserAction) => {
  return `https://user?action=${type}`;
};

type UserAction = 'signup' | 'confirm' | 'login' | 'refresh' | 'details' | 'purchase';

export interface KVTokenData {
  userId: string;
  email: string;
  clientId: string;
  name: string;
}

export class User implements DurableObject {
  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const action = searchParams.get('action') as UserAction;

    switch (action) {
      case 'signup': {
        const req = (await request.json()) as UserSignupRequest;

        // ensure that a user doesn't already exist with this email address
        const userState = await this.state.storage.get<string>('state');
        if (!userState || userState === 'unconfirmed') {
          // create a unique code associated with this email address
          const email = req.email.toLowerCase();
          const code = crypto.randomUUID().substring(0, 6).toUpperCase();

          // associate this code with the email address
          this.state.storage.put<string>(`code`, code);
          this.state.storage.put<string>(`state`, 'unconfirmed');

          console.log('generated email with code', code, 'for', email, '.');

          try {
            const emailResult = await sendEmail(email, 'Welcome to the game', `Please confirm your email address with code ${code}`);
            return status(201, { message: 'Email sent' });
          } catch (e) {
            return status(400, { error: 'Unable to sign up' });
          }
        } else {
          return status(400, { error: 'Problem whilst signing up' });
        }
      }
      case 'confirm': {
        const req = (await request.json()) as ConfirmUserSignupRequest;

        // ensure this email hasn't already been confirmed or doesn't exist
        const userState = await this.state.storage.get<string>('state');
        if (!userState || userState !== 'unconfirmed') {
          return status(400, { error: 'Invalid status' });
        }

        // read the code we saved earlier and compare it to the code provided
        const code = await this.state.storage.get<string>(`code`);
        if (code === req.code) {
          // if the code matches, we can confirm the user
          const id = this.env.CARD_COLLECTION.idFromName('global');
          const obj = this.env.CARD_COLLECTION.get(id);

          return onUserSignedUp(this.state.storage, this.env.ACCESS_TOKENS, obj, req);
        } else {
          return status(400, { error: 'Unable to confirm user' });
        }
      }
      case 'login': {
        const req = (await request.json()) as LoginRequest;
        const userId = (await this.state.storage.get<string>(`userId`)) || '';
        const salt = (await this.state.storage.get<string>(`salt`)) || '';
        const name = (await this.state.storage.get<string>(`name`)) || '';

        const providedHash = await createDigest(req.password, salt);
        const passwordHash = await this.state.storage.get<string>(`password`);

        if (providedHash !== passwordHash) {
          return status(400, { error: 'invalid username or password' });
        }

        return onUserLoggedIn(this.env.ACCESS_TOKENS, {
          userId: userId,
          email: req.email,
          clientId: req.client_id,
          name: name
        } as KVTokenData);
      }
      case 'refresh': {
        // lookup the data associated with the refresh token in workers kv
        const req = (await request.json()) as RefreshTokenRequest;
        const refreshToken = await this.env.ACCESS_TOKENS.get<KVTokenData>(`refresh:${req.refresh_token}`, 'json');
        if (!refreshToken || refreshToken.clientId != req.client_id) {
          return status(400, { error: 'invalid refresh token' });
        }

        const name = (await this.state.storage.get<string>(`name`)) || '';

        // create a new access token
        const accessToken = crypto.randomUUID();
        const accessTokenExpiry = 3600;
        await this.env.ACCESS_TOKENS.put(
          `access:${accessToken}`,
          JSON.stringify({
            userId: refreshToken.userId,
            email: refreshToken.email,
            clientId: req.client_id,
            name: name
          } as KVTokenData),
          { expirationTtl: accessTokenExpiry }
        );
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + accessTokenExpiry);

        return status(201, {
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
          token_type: 'bearer'
        } as RefreshTokenResponse);
      }
      case 'details': {
        const points = (await this.state.storage.get<number>(`points`)) || 0;
        const name = (await this.state.storage.get<string>(`name`)) || 0;
        return status(200, { name, points } as UserDetailsResponse);
      }
      case 'purchase': {
        try {
          const req = (await request.json()) as PurchaseRequest;

          // set amount based on the type and kind of the purchase request
          if (req.type !== 'pack') {
            return status(400, { error: 'Unknown type' });
          }

          const requiredPoints = {
            basic: 100,
            premium: 500,
            ultimate: 1000
          }[req.kind];

          // ensure we have enough points to make this purchase
          const points = (await this.state.storage.get<number>(`points`)) || 0;
          if (points < requiredPoints) {
            return status(400, { error: 'Not enough points' });
          }

          const userId = await this.state.storage.get<string>(`userId`);
          if (!userId) {
            return status(400, { error: 'Invalid user' });
          }

          const cardsInPack: { id: number; edition: CardEdition }[] = CardKinds.filter((card) => card.rarity == 1)
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
            .map((c) => {
              return { edition: c.edition, id: c.id };
            });

          const modifyCardsRequest: UpdateCardCollectionRequest = {};
          modifyCardsRequest[userId] = {
            add: cardsInPack,
            remove: []
          };

          const id = this.env.CARD_COLLECTION.idFromName('global');
          const cards = this.env.CARD_COLLECTION.get(id);

          cards.fetch(updateCardsAction(), {
            method: 'POST',
            body: JSON.stringify(modifyCardsRequest)
          });

          const pointsRemaining = points - requiredPoints;
          const result: PurchaseResponse = {
            points: pointsRemaining,
            entries: cardsInPack.map((entry) => {
              const c = CardKinds.find((card) => card.id == entry.id && card.edition == entry.edition);
              if (!c) {
                throw new Error('Unable to find card definition');
              }

              return {
                acquired_at: new Date(),
                card: {
                  kind: c.id,
                  edition: c.edition,
                  name: c.name,
                  up: c.up,
                  down: c.down,
                  left: c.left,
                  right: c.right,
                  element: c.element
                } as ViewableCardResponse
              };
            })
          };

          // set the users points remaining
          await this.state.storage.put<number>(`points`, pointsRemaining);

          return status(201, result);
        } catch (err) {
          console.log(err);
          return status(400, { error: 'Unable to purchase' });
        }
      }
      default: {
        return status(400, { error: 'Unknown action' });
      }
    }
  }
}

const sendEmail = (recipient: string, subject: string, message: string) => {
  const email = new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: recipient }]
        }
      ],
      from: {
        email: 'webmaster@ttelements.com',
        name: 'Jason @ ttelements'
      },
      subject: subject,
      content: [
        {
          type: 'text/plain',
          value: message
        }
      ]
    })
  });
  return fetch(email);
};

const createDigest = async (password: string, salt: string) => {
  // TODO: this isn't ideal, but it's the only way to do it in a worker
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const result = await crypto.subtle.digest('SHA-256', data); // not suitable for passwords :(
  const hashArray = Array.from(new Uint8Array(result));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const onUserSignedUp = async (store: DurableObjectStorage, tokenStore: KVNamespace<string>, cards: DurableObjectStub, req: ConfirmUserSignupRequest) => {
  const userId = crypto.randomUUID();
  const password = req.password;

  store.put<string>(`state`, 'confirmed');

  const salt = crypto.randomUUID();

  store.put<string>(`userId`, userId);
  const name = req.email.split('@')[0];
  store.put<string>(`name`, name);
  store.put<number>(`points`, 100);
  store.put<string>(`salt`, salt);

  // generate a starter deck for this user
  await cards.fetch(resetUserCardsAction(userId), {
    method: 'POST'
  });

  const passwordHash = await createDigest(password, salt);

  store.put<string>(`password`, passwordHash);

  return onUserLoggedIn(tokenStore, {
    userId: userId,
    email: req.email,
    clientId: req.client_id,
    name: name
  } as KVTokenData);
};

function onUserLoggedIn(tokenStore: KVNamespace<string>, token: KVTokenData): Response | PromiseLike<Response> {
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();

  // Set the access token lookup in workers KV storage
  const accessTokenExpiry = 3600;
  const refreshTokenExpiry = 30 * 24 * 60 * 60;
  tokenStore.put(`access:${accessToken}`, JSON.stringify(token), { expirationTtl: accessTokenExpiry });
  tokenStore.put(`refresh:${refreshToken}`, JSON.stringify(token), { expirationTtl: refreshTokenExpiry });

  // convert ttl to instant
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + accessTokenExpiry);

  return status(201, {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt.toISOString(),
    token_type: 'bearer'
  } as LoginResponse);
}
