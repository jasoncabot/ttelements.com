import { describe, expect, it } from "vitest";

describe("Should have the right number of cards", () => {
  it("should have 5 cards", () => {
    const cards = [
      { id: 1, name: "Card 1" },
      { id: 2, name: "Card 2" },
      { id: 3, name: "Card 3" },
      { id: 4, name: "Card 4" },
      { id: 5, name: "Card 5" },
    ];
    expect(cards.length).toBe(5);
  });
});
