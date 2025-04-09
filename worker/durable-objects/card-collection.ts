import { DurableObject } from "cloudflare:workers";

import {
  CardEdition,
  CardKinds,
  OwnedCardResponse,
  UpdateCardCollectionRequest,
  UpdateCardCollectionResponse,
  ViewableCardResponse,
} from "../../src/shared";
import { CardEntry } from "./game";
import { error, json } from "itty-router";

export const listOwnedCardsAction = (userId: string) =>
  `${durableObjectGameAction("list_owned")}&userId=${userId}`;
export const resetUserCardsAction = (userId: string) =>
  `${durableObjectGameAction("reset")}&userId=${userId}`;
export const updateCardsAction = () => `${durableObjectGameAction("update")}`;

const durableObjectGameAction = (type: CardCollectionAction) => {
  return `https://card_collection?action=${type}`;
};

type CardCollectionAction = "list_owned" | "reset" | "update";

export type OwnedCardEntry = {
  card: CardEntry;
  acquired_at: Date;
};

export class CardCollection extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const action = searchParams.get("action") as CardCollectionAction;

    switch (action) {
      case "list_owned": {
        const userId = searchParams.get("userId")!;

        const cardsForUser = await this.ctx.storage.get<OwnedCardEntry[]>(
          `u:${userId}`,
        );

        if (!cardsForUser) {
          return error(404, { error: "No cards found" });
        }

        return json(
          {
            entries: [
              ...cardsForUser.map((entry: OwnedCardEntry) => {
                return {
                  acquired_at: entry.acquired_at,
                  card: entry.card,
                };
              }),
            ],
          } as OwnedCardResponse,
          { status: 200 },
        );
      }
      case "reset": {
        const userId = searchParams.get("userId")!;

        const available = CardKinds;

        // find all cards that are common
        const common = available.filter((card) => card.rarity == 'common');

        // shuffle and take the first 15
        const startingCards = common
          .sort(() => Math.random() - 0.5)
          .slice(0, 15)
          .map(
            (c) =>
              ({
                kind: c.id,
                edition: c.edition,
                name: c.name,
                up: c.up,
                down: c.down,
                left: c.left,
                right: c.right,
                element: c.element,
              }) as ViewableCardResponse,
          );

        const ownedCardEntries = startingCards.map((card) => {
          return {
            acquired_at: new Date(),
            card,
          } as OwnedCardEntry;
        });

        this.ctx.storage.put<OwnedCardEntry[]>(`u:${userId}`, ownedCardEntries);

        return json(
          {
            entries: ownedCardEntries,
          } as OwnedCardResponse,
          { status: 200 },
        );
      }
      case "update": {
        const req = (await request.json()) as UpdateCardCollectionRequest;

        const entries: Record<string, OwnedCardResponse> = {};
        for (const [userId, updates] of Object.entries(req)) {
          const ownedCardEntries =
            (await this.ctx.storage.get<OwnedCardEntry[]>(`u:${userId}`)) || [];

          const cardsLeftToRemove = updates.remove;
          for (
            let i = 0;
            i < ownedCardEntries.length && cardsLeftToRemove.length > 0;
            i++
          ) {
            const ownedCard = ownedCardEntries[i];
            const removeIndex = cardsLeftToRemove.findIndex(
              (r) =>
                r.id == ownedCard.card.kind &&
                r.edition == ownedCard.card.edition,
            );

            if (removeIndex >= 0) {
              ownedCardEntries.splice(i, 1);
              cardsLeftToRemove.splice(removeIndex, 1);
            }
          }

          updates.add.forEach((addition) => {
            const card = findCardById(addition.id, addition.edition);
            ownedCardEntries.push({
              acquired_at: new Date(),
              card,
            } as OwnedCardEntry);
          });

          this.ctx.storage.put<OwnedCardEntry[]>(
            `u:${userId}`,
            ownedCardEntries,
          );

          entries[userId] = {
            entries: ownedCardEntries.map((entry) => {
              return {
                acquired_at: entry.acquired_at,
                card: {
                  kind: entry.card.kind,
                  edition: entry.card.edition,
                  name: entry.card.name,
                  up: entry.card.up,
                  down: entry.card.down,
                  left: entry.card.left,
                  right: entry.card.right,
                  element: entry.card.element,
                } as ViewableCardResponse,
              };
            }),
          };
        }

        return json(entries as UpdateCardCollectionResponse, { status: 200 });
      }
      default: {
        return error(400, "Unknown action");
      }
    }
  }
}

const findCardById: (
  id: number,
  edition: CardEdition,
) => CardEntry | undefined = (id: number, edition: CardEdition) => {
  const found = CardKinds.find(
    (card) => card.id == id && card.edition == edition,
  );
  if (found) {
    return {
      kind: found.id,
      edition: found.edition,
      name: found.name,
      up: found.up,
      down: found.down,
      left: found.left,
      right: found.right,
      element: found.element,
      played: false,
    } as CardEntry;
  }
  return undefined;
};
