import { OwnedCardResponse } from "./collection";

export type PurchaseType = "booster" | "card";
export type PurchaseKind = "basic" | "premium" | "ultimate";

export type PurchaseRequest = {
  type: PurchaseType;
  kind: PurchaseKind;
};

export type PurchaseResponse = OwnedCardResponse & {
  points: number;
};
