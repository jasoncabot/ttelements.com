import { OwnedCardResponse } from "./collection";

export type PurchaseRequest = {
  type: "pack";
  kind: "basic" | "premium" | "ultimate";
};

export type PurchaseResponse = OwnedCardResponse & {
  points: number;
};
