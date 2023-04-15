import { CardEdition, CardKinds, OwnedCardResponse, UpdateCardCollectionRequest, UpdateCardCollectionResponse, ViewableCardResponse } from '@ttelements/shared';
import { status } from 'itty-router-extras';
import { CardEntry } from './game';

export const listOwnedCardsAction = (userId: string) => `${durableObjectGameAction('list_owned')}&userId=${userId}`;
export const resetUserCardsAction = (userId: string) => `${durableObjectGameAction('reset')}&userId=${userId}`;
export const updateCardsAction = () => `${durableObjectGameAction('update')}`;

const durableObjectGameAction = (type: CardCollectionAction) => {
  return `https://card_collection?action=${type}`;
};

type CardCollectionAction = 'list_owned' | 'reset' | 'update';

export type OwnedCardEntry = {
  card: CardEntry;
  acquired_at: Date;
};

export class CardCollection implements DurableObject {
  constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const action = searchParams.get('action') as CardCollectionAction;

    switch (action) {
      case 'list_owned': {
        const userId = searchParams.get('userId')!;

        const cardsForUser = await this.state.storage.get<OwnedCardEntry[]>(`u:${userId}`);

        if (!cardsForUser) {
          return status(404, { error: 'No cards found' });
        }

        return status(200, {
          entries: [
            ...cardsForUser.map((entry: OwnedCardEntry) => {
              return {
                acquired_at: entry.acquired_at,
                card: entry.card
              };
            })
          ]
        } as OwnedCardResponse);
      }
      case 'reset': {
        const userId = searchParams.get('userId')!;

        const available = CardKinds;

        // find all cards that are common
        const common = available.filter((card) => card.rarity == 1);

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
                element: c.element
              } as ViewableCardResponse)
          );

        const ownedCardEntries = startingCards.map((card) => {
          return {
            acquired_at: new Date(),
            card
          } as OwnedCardEntry;
        });

        this.state.storage.put<OwnedCardEntry[]>(`u:${userId}`, ownedCardEntries);

        return status(200, {
          entries: ownedCardEntries
        } as OwnedCardResponse);
      }
      case 'update': {
        const req = (await request.json()) as UpdateCardCollectionRequest;

        const entries: Record<string, OwnedCardResponse> = {};
        for (const [userId, updates] of Object.entries(req)) {
          const ownedCardEntries = (await this.state.storage.get<OwnedCardEntry[]>(`u:${userId}`)) || [];

          const cardsLeftToRemove = updates.remove;
          for (let i = 0; i < ownedCardEntries.length && cardsLeftToRemove.length > 0; i++) {
            const ownedCard = ownedCardEntries[i];
            const removeIndex = cardsLeftToRemove.findIndex((r) => r.id == ownedCard.card.kind && r.edition == ownedCard.card.edition);

            if (removeIndex >= 0) {
              ownedCardEntries.splice(i, 1);
              cardsLeftToRemove.splice(removeIndex, 1);
            }
          }

          updates.add.forEach((addition) => {
            const card = findCardById(addition.id, addition.edition);
            ownedCardEntries.push({
              acquired_at: new Date(),
              card
            } as OwnedCardEntry);
          });

          this.state.storage.put<OwnedCardEntry[]>(`u:${userId}`, ownedCardEntries);

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
                  element: entry.card.element
                } as ViewableCardResponse
              };
            })
          };
        }

        return status(200, entries as UpdateCardCollectionResponse);
      }
      default: {
        return status(400, { error: 'Unknown action' });
      }
    }
  }
}

const findCardById: (id: number, edition: CardEdition) => CardEntry | undefined = (id: number, edition: CardEdition) => {
  const found = CardKinds.find((card) => card.id == id && card.edition == edition);
  if (found) {
    return {
      kind: found.id,
      edition: found.edition,
      name: found.name,
      up: found.up,
      down: found.down,
      left: found.left,
      right: found.right,
      element: found.element
    } as CardEntry;
  }
  return undefined;
};
