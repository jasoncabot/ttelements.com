import { DurableObject } from "cloudflare:workers";

import { error, json } from "itty-router";
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
  ViewableCardResponse,
} from "../../src/shared";
import { resetUserCardsAction, updateCardsAction } from "./card-collection";
import { generateHash } from "../../src/shared/auth";
import { PurchaseKind } from "../../src/shared/shop";
import { rarityMapByEdition } from "../../src/shared/cards";

export const createSignupAction = () => `${durableObjectGameAction("signup")}`;
export const confirmSignupAction = () =>
  `${durableObjectGameAction("confirm")}`;
export const loginAction = () => `${durableObjectGameAction("login")}`;
export const refreshTokenAction = () => `${durableObjectGameAction("refresh")}`;
export const userDetailsAction = () => `${durableObjectGameAction("details")}`;
export const purchaseAction = () => `${durableObjectGameAction("purchase")}`;

const durableObjectGameAction = (type: UserAction) => {
  return `https://user?action=${type}`;
};

type UserAction =
  | "signup"
  | "confirm"
  | "login"
  | "refresh"
  | "details"
  | "purchase";

export interface KVTokenData {
  userId: string;
  email: string;
  clientId: string;
  name: string;
}

export class User extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const action = searchParams.get("action") as UserAction;

    switch (action) {
      case "signup": {
        const req = (await request.json()) as UserSignupRequest;

        // TODO: this should be a list of allowed emails
        const allowList = [
          "21860adb182b9df4b5447ccc4fafa3061310e0cddc37a37847e420dedb4ad642",
          "b97c5484bf2a792ac0425012bb8e20f8b014d4fd89457a90ea2bf150f7ce9cbc",
        ];
        const hashedSignupEmail = await generateHash(
          req.email + "and some salty stuff",
        );

        if (!allowList.includes(hashedSignupEmail)) {
          console.log("not in allow list", hashedSignupEmail);
          return error(400, "Email not allowed");
        }

        // ensure that a user doesn't already exist with this email address
        const userState = await this.ctx.storage.get<string>("state");
        if (!userState || userState === "unconfirmed") {
          // create a unique code associated with this email address
          const email = req.email.toLowerCase();
          const code = crypto.randomUUID().substring(0, 6).toUpperCase();

          // associate this code with the email address
          this.ctx.storage.put<string>(`code`, code);
          this.ctx.storage.put<string>(`state`, "unconfirmed");

          console.log("generated email with code", code, "for", email, ".");

          try {
            await sendVerifyEmail(this.env, email, code);
            return json({ message: "Email sent" }, { status: 201 });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            return error(400, "unable to send email");
          }
        } else {
          return error(400, "Problem whilst signing up");
        }
      }
      case "confirm": {
        const req = (await request.json()) as ConfirmUserSignupRequest;

        // ensure this email hasn't already been confirmed or doesn't exist
        const userState = await this.ctx.storage.get<string>("state");
        if (!userState || userState !== "unconfirmed") {
          return error(400, "Problem whilst confirming email");
        }

        // read the code we saved earlier and compare it to the code provided
        const code = await this.ctx.storage.get<string>(`code`);
        if (code === req.code) {
          // if the code matches, we can confirm the user
          const id = this.env.CARD_COLLECTION.idFromName("global");
          const obj = this.env.CARD_COLLECTION.get(id);

          return onUserSignedUp(
            this.ctx.storage,
            this.env.ACCESS_TOKENS,
            obj,
            req,
          );
        } else {
          return error(400, "Invalid code");
        }
      }
      case "login": {
        const req = (await request.json()) as LoginRequest;
        const userId = (await this.ctx.storage.get<string>(`userId`)) || "";
        const salt = (await this.ctx.storage.get<string>(`salt`)) || "";
        const name = (await this.ctx.storage.get<string>(`name`)) || "";

        const providedHash = await createDigest(req.password, salt);
        const passwordHash = await this.ctx.storage.get<string>(`password`);

        if (providedHash !== passwordHash) {
          return error(400, "Invalid username or password");
        }

        return onUserLoggedIn(this.env.ACCESS_TOKENS, {
          userId: userId,
          email: req.email,
          clientId: req.client_id,
          name: name,
        } as KVTokenData);
      }
      case "refresh": {
        // lookup the data associated with the refresh token in workers kv
        const req = (await request.json()) as RefreshTokenRequest;
        const refreshToken = await this.env.ACCESS_TOKENS.get<KVTokenData>(
          `refresh:${req.refresh_token}`,
          "json",
        );
        if (!refreshToken || refreshToken.clientId != req.client_id) {
          return error(400, "Invalid refresh token");
        }

        const name = (await this.ctx.storage.get<string>(`name`)) || "";

        // create a new access token
        const accessToken = crypto.randomUUID();
        const accessTokenExpiry = 3600;
        await this.env.ACCESS_TOKENS.put(
          `access:${accessToken}`,
          JSON.stringify({
            userId: refreshToken.userId,
            email: refreshToken.email,
            clientId: req.client_id,
            name: name,
          } as KVTokenData),
          { expirationTtl: accessTokenExpiry },
        );
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + accessTokenExpiry);

        return json(
          {
            access_token: accessToken,
            expires_at: expiresAt.toISOString(),
            token_type: "bearer",
          } as RefreshTokenResponse,
          { status: 201 },
        );
      }
      case "details": {
        const points = (await this.ctx.storage.get<number>(`points`)) || 0;
        const name = (await this.ctx.storage.get<string>(`name`)) || 0;
        return json({ name, points } as UserDetailsResponse, { status: 200 });
      }
      case "purchase": {
        try {
          const req = (await request.json()) as PurchaseRequest;

          // set amount based on the type and kind of the purchase request
          if (req.type !== "booster") {
            return error(400, "Unknown type");
          }

          const requiredPoints = {
            basic: 0, //100,
            premium: 0, // 500,
            ultimate: 0, // 1000,
          }[req.kind];

          // ensure we have enough points to make this purchase
          const points = (await this.ctx.storage.get<number>(`points`)) || 0;
          if (points < requiredPoints) {
            return error(400, "Not enough points");
          }

          const userId = await this.ctx.storage.get<string>(`userId`);
          if (!userId) {
            return error(400, "Invalid user");
          }

          const cardsInPack: { id: number; edition: CardEdition }[] =
            generateRandomPack(req.kind, "ff8");

          const modifyCardsRequest: UpdateCardCollectionRequest = {};
          modifyCardsRequest[userId] = {
            add: cardsInPack,
            remove: [],
          };

          const id = this.env.CARD_COLLECTION.idFromName("global");
          const cards = this.env.CARD_COLLECTION.get(id);

          cards.fetch(updateCardsAction(), {
            method: "POST",
            body: JSON.stringify(modifyCardsRequest),
          });

          const pointsRemaining = points - requiredPoints;
          const result: PurchaseResponse = {
            points: pointsRemaining,
            entries: cardsInPack.map((entry) => {
              const c = CardKinds.find(
                (card) => card.id == entry.id && card.edition == entry.edition,
              );
              if (!c) {
                throw new Error("Unable to find card definition");
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
                  element: c.element,
                } as ViewableCardResponse,
              };
            }),
          };

          // set the users points remaining
          await this.ctx.storage.put<number>(`points`, pointsRemaining);

          return json(result, { status: 201 });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          return error(400, "Unable to process purchase");
        }
      }
      default: {
        return error(400, "Unknown action");
      }
    }
  }
}

const sendVerifyEmail = async (env: Env, recipient: string, code: string) => {
  const apiKey = env.MAILGUN_API_KEY;
  const endpoint = `https://api.mailgun.net/v3/notify.ttelements.com/messages`;
  const host = env.MAILGUN_RETURN_HOST;

  const body = new URLSearchParams();
  body.append("from", "ttelements <noreply@notify.ttelements.com>");
  body.append("to", recipient);
  body.append("subject", "Verify your email to complete signup");
  body.append("template", "verify-email");
  body.append(
    "h:X-Mailgun-Variables",
    JSON.stringify({
      code: code,
      verification_url: `${host}/register?email=${recipient}&code=${code}`,
      year: new Date().getFullYear(),
    }),
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Mailgun API Error:", responseData);
      throw new Error(
        `Mailgun API request failed with status ${response.status}`,
      );
    }

    console.log("Mailgun API Success:", responseData);
  } catch (error) {
    console.error("Error sending email via Mailgun API:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

const createDigest = async (password: string, salt: string) => {
  // TODO: this isn't ideal, but it's the only way to do it in a worker
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const result = await crypto.subtle.digest("SHA-256", data); // not suitable for passwords :(
  const hashArray = Array.from(new Uint8Array(result));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

const onUserSignedUp = async (
  store: DurableObjectStorage,
  tokenStore: KVNamespace<string>,
  cards: DurableObjectStub,
  req: ConfirmUserSignupRequest,
) => {
  const userId = crypto.randomUUID();
  const password = req.password;

  store.put<string>(`state`, "confirmed");

  const salt = crypto.randomUUID();

  store.put<string>(`userId`, userId);
  const name = req.email.split("@")[0];
  store.put<string>(`name`, name);
  store.put<number>(`points`, 100);
  store.put<string>(`salt`, salt);

  // generate a starter deck for this user
  await cards.fetch(resetUserCardsAction(userId), {
    method: "POST",
  });

  const passwordHash = await createDigest(password, salt);

  store.put<string>(`password`, passwordHash);

  return onUserLoggedIn(tokenStore, {
    userId: userId,
    email: req.email,
    clientId: req.client_id,
    name: name,
  } as KVTokenData);
};

function onUserLoggedIn(
  tokenStore: KVNamespace<string>,
  token: KVTokenData,
): Response | PromiseLike<Response> {
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();

  // Set the access token lookup in workers KV storage
  const accessTokenExpiry = 3600;
  const refreshTokenExpiry = 30 * 24 * 60 * 60;
  tokenStore.put(`access:${accessToken}`, JSON.stringify(token), {
    expirationTtl: accessTokenExpiry,
  });
  tokenStore.put(`refresh:${refreshToken}`, JSON.stringify(token), {
    expirationTtl: refreshTokenExpiry,
  });

  // convert ttl to instant
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + accessTokenExpiry);

  return json(
    {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      token_type: "bearer",
    } as LoginResponse,
    { status: 201 },
  );
}
function generateRandomPack(
  kind: PurchaseKind,
  edition: CardEdition,
): { id: number; edition: CardEdition }[] {
  const cards: { id: number; edition: CardEdition }[] = [];

  switch (kind) {
    // a basic pack if 5 common cards
    case "basic":
      {
        // a basic pack is 4 common cards and 1 card from [("uncommon", 95%), ("rare" @ 4%), ("ultra-rare" @ 1%)]
        cards.push(
          ...rarityMapByEdition[edition].common
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4),
        );
        const rand = Math.random();
        let selectedRarity: "uncommon" | "rare" | "ultra-rare";
        if (rand < 0.95) {
          selectedRarity = "uncommon";
        } else if (rand < 0.99) {
          selectedRarity = "rare";
        } else {
          selectedRarity = "ultra-rare";
        }
        cards.push(
          ...rarityMapByEdition[edition][selectedRarity]
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 1)
            .map((c) => {
              return { edition: c.edition, id: c.id };
            }),
        );
      }
      break;
    case "premium":
      {
        // a premium pack is 3 common cards, 1 card from [("uncommon", 70%), ("rare" @ 20%), ("ultra-rare" @ 10%)] and 1 card from [("rare", 90%), ("ultra-rare" @ 10%)]
        cards.push(
          ...rarityMapByEdition[edition].common
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3),
        );
        const rand = Math.random();
        let selectedRarity: "uncommon" | "rare" | "ultra-rare";
        if (rand < 0.7) {
          selectedRarity = "uncommon";
        } else if (rand < 0.9) {
          selectedRarity = "rare";
        } else {
          selectedRarity = "ultra-rare";
        }
        cards.push(
          ...rarityMapByEdition[edition][selectedRarity]
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 1)
            .map((c) => {
              return { edition: c.edition, id: c.id };
            }),
        );
        const rand2 = Math.random();
        let selectedRarity2: "rare" | "ultra-rare";
        if (rand2 < 0.9) {
          selectedRarity2 = "rare";
        } else {
          selectedRarity2 = "ultra-rare";
        }
        cards.push(
          ...rarityMapByEdition[edition][selectedRarity2]
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 1)
            .map((c) => {
              return { edition: c.edition, id: c.id };
            }),
        );
      }
      break;
    case "ultimate":
      {
        // an ultimate pack is 3 uncommon cards, 1 card from [("rare" @ 50%), ("ultra-rare" @ 50%)] and 1 card from [("ultra-rare", 90%), ("legendary" @ 10%)]
        cards.push(
          ...rarityMapByEdition[edition].uncommon
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3),
        );
        const rand = Math.random();
        let selectedRarity: "rare" | "ultra-rare";
        if (rand < 0.5) {
          selectedRarity = "rare";
        } else {
          selectedRarity = "ultra-rare";
        }
        cards.push(
          ...rarityMapByEdition[edition][selectedRarity]
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 1)
            .map((c) => {
              return { edition: c.edition, id: c.id };
            }),
        );
        const rand2 = Math.random();
        let selectedRarity2: "ultra-rare" | "legendary";
        if (rand2 < 0.9) {
          selectedRarity2 = "ultra-rare";
        } else {
          selectedRarity2 = "legendary";
        }
        cards.push(
          ...rarityMapByEdition[edition][selectedRarity2]
            .filter((card) => Math.random() < card.weightModifier)
            .sort(() => Math.random() - 0.5)
            .slice(0, 1)
            .map((c) => {
              return { edition: c.edition, id: c.id };
            }),
        );
      }
      break;
    default:
      throw new Error("Unknown pack kind");
  }

  return cards;
}
