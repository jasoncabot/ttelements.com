import { CardEdition } from "./cards";
import { ViewableCardResponse } from "./games";

export type ListOwnedCardsRequest = object;

export type OwnedCardResponse = {
  entries: {
    acquired_at: Date;
    card: ViewableCardResponse;
  }[];
};

export type UpdateCardCollectionRequest = Record<
  string,
  {
    add: { edition: CardEdition; id: number }[];
    remove: { edition: CardEdition; id: number }[];
  }
>;

export type UpdateCardCollectionResponse = Record<string, OwnedCardResponse>;
