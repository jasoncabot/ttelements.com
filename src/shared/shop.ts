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

export const PackCosts: Record<PurchaseKind, number> = {
  basic: 1, //00,
  premium: 500,
  ultimate: 1000,
};
