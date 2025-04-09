import { CardElement } from "./../src/shared";
import { calculateFlips, processFlips } from "./../src/shared/flips";
import { GameResponse, GameRule, SpaceResponse } from "./../src/shared";

test("processFlips should be callable", () => {
  expect(processFlips).toBeDefined();
});

test("placing a card should create a single change of type place", () => {
  const game = gameWithCardsInSpaces(
    [{ space: 0, up: 5, down: 5, left: 5, right: 5 }],
    ["open"],
  );
  const space = 0;

  const response = processFlips(game, space);
  expect(response).toHaveLength(1);
  expect(response[0].get(0)).toMatchObject({
    type: "place",
    direction: "none",
  });
});

describe("combo", () => {
  test("should not be triggered by a basic flip", () => {
    const spaces: any[] = [
      { space: 0, up: 6, down: 6, left: 6, right: 6, owner: "you" },

      { space: 1, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
      { space: 2, up: 4, down: 4, left: 4, right: 5, owner: "opponent" },
      { space: 3, up: 6, down: 6, left: 6, right: 6, owner: "opponent" },
    ];

    const response = processFlips(
      gameWithCardsInSpaces(spaces, ["open", "combo"]),
      0,
    );
    expect(response).toHaveLength(2);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });

  test("should be triggered by a special flip such as same", () => {
    const spaces: any[] = [
      { space: 0, up: 6, down: 6, left: 6, right: 6, owner: "you" },

      { space: 1, up: 6, down: 6, left: 6, right: 6, owner: "opponent" },
      { space: 2, up: 4, down: 4, left: 4, right: 5, owner: "opponent" },
      { space: 3, up: 6, down: 6, left: 6, right: 6, owner: "opponent" },
    ];

    const response = processFlips(
      gameWithCardsInSpaces(spaces, ["open", "same", "combo"]),
      0,
    );
    expect(response).toHaveLength(3);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "left",
    });
    expect(response[1].get(3)).toMatchObject({
      type: "flip",
      direction: "up",
    });
    expect(response[2].get(2)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });
});

describe("same rule", () => {
  test("not applied", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 3, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 5, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
        { space: 7, up: 7, down: 7, left: 7, right: 7, owner: "opponent" },
      ],
      ["open", "same"],
    );
    const space = 4;

    const response = processFlips(game, space);
    expect(response).toHaveLength(1);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
  });
  test("top and left", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 3, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 5, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
        { space: 7, up: 7, down: 7, left: 7, right: 7, owner: "opponent" },
      ],
      ["open", "same"],
    );
    const space = 4;

    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "down",
    });
    expect(response[1].get(3)).toMatchObject({
      type: "flip",
      direction: "right",
    });
  });
  test("top and right", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 3, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 5, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 7, up: 7, down: 7, left: 7, right: 7, owner: "opponent" },
      ],
      ["open", "same"],
    );
    const space = 4;

    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "down",
    });
    expect(response[1].get(5)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });
  test("bottom and left", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 7, down: 7, left: 7, right: 7, owner: "opponent" },
        { space: 3, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 5, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
        { space: 7, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
      ],
      ["open", "same"],
    );

    const space = 4;
    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(3)).toMatchObject({
      type: "flip",
      direction: "right",
    });
    expect(response[1].get(7)).toMatchObject({
      type: "flip",
      direction: "up",
    });
  });
  test("bottom and right", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 7, down: 7, left: 7, right: 7, owner: "opponent" },
        { space: 3, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 5, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 7, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
      ],
      ["open", "same"],
    );

    const space = 4;
    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(5)).toMatchObject({
      type: "flip",
      direction: "left",
    });
    expect(response[1].get(7)).toMatchObject({
      type: "flip",
      direction: "up",
    });
  });
  test("top and bottom", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 3, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 5, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
        { space: 7, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
      ],
      ["open", "same"],
    );

    const space = 4;
    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "down",
    });
    expect(response[1].get(7)).toMatchObject({
      type: "flip",
      direction: "up",
    });
  });
  test("left and right", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 4, up: 1, down: 1, left: 1, right: 1, owner: "you" },

        { space: 1, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 3, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 5, up: 1, down: 1, left: 1, right: 1, owner: "opponent" },
        { space: 7, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
      ],
      ["open", "same"],
    );

    const space = 4;
    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(3)).toMatchObject({
      type: "flip",
      direction: "right",
    });
    expect(response[1].get(5)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });
});

describe("plus rule", () => {
  test("top, bottom, left, right", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 0, up: 2, down: 2, left: 3, right: 3, owner: "you" },
        { space: 2, up: 2, down: 2, left: 3, right: 3, owner: "you" },
        { space: 6, up: 2, down: 2, left: 3, right: 3, owner: "you" },
        { space: 8, up: 2, down: 2, left: 3, right: 3, owner: "you" },

        { space: 1, up: 2, down: 2, left: 2, right: 2, owner: "opponent" },
        { space: 3, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 5, up: 3, down: 3, left: 3, right: 3, owner: "opponent" },
        { space: 7, up: 2, down: 2, left: 2, right: 2, owner: "opponent" },
      ],
      ["open", "plus"],
    );

    const referenceFlips: {
      space: number;
      a: number;
      ad: string;
      b: number;
      bd: string;
    }[] = [
      { space: 0, a: 3, ad: "up", b: 1, bd: "left" },
      { space: 2, a: 1, ad: "right", b: 5, bd: "up" },
      { space: 6, a: 3, ad: "down", b: 7, bd: "left" },
      { space: 8, a: 5, ad: "down", b: 7, bd: "right" },
    ];

    referenceFlips.forEach((data) => {
      const response = processFlips(game, data.space);
      expect(response).toHaveLength(2);
      expect(response[0].get(data.space)).toMatchObject({
        type: "place",
        direction: "none",
      });
      expect(response[1].get(data.a)).toMatchObject({
        type: "flip",
        direction: data.ad,
      });
      expect(response[1].get(data.b)).toMatchObject({
        type: "flip",
        direction: data.bd,
      });
    });
  });

  test("plus wall", () => {
    const game = gameWithCardsInSpaces(
      [
        { space: 1, up: 3, down: 4, left: 1, right: 1, owner: "you" },
        { space: 3, up: 1, down: 1, left: 3, right: 4, owner: "you" },
        { space: 5, up: 1, down: 1, left: 4, right: 3, owner: "you" },
        { space: 7, up: 4, down: 3, left: 1, right: 1, owner: "you" },

        { space: 4, up: 9, down: 9, left: 9, right: 9, owner: "opponent" },
      ],
      ["open", "pluswall"],
    );

    const referenceFlips: {
      space: number;
      dir: string;
    }[] = [
      { space: 1, dir: "up" },
      { space: 3, dir: "left" },
      { space: 5, dir: "right" },
      { space: 7, dir: "down" },
    ];

    referenceFlips.forEach((data) => {
      const response = processFlips(game, data.space);
      expect(response).toHaveLength(2);
      expect(response[0].get(data.space)).toMatchObject({
        type: "place",
        direction: "none",
      });
      expect(response[1].get(4)).toMatchObject({
        type: "flip",
        direction: data.dir,
      });
    });
  });
});

describe("same wall rule", () => {
  Object.entries({ 1: "up", 3: "left", 5: "right", 7: "down" }).forEach(
    ([key, direction]) => {
      test(`playing card in posistion ${key} against wall`, () => {
        const game = gameWithCardsInSpaces(
          [
            {
              space: 4,
              up: 10,
              down: 10,
              left: 10,
              right: 10,
              owner: "opponent",
            },

            { space: 1, up: 10, down: 10, left: 10, right: 10, owner: "you" },
            { space: 3, up: 10, down: 10, left: 10, right: 10, owner: "you" },
            { space: 5, up: 10, down: 10, left: 10, right: 10, owner: "you" },
            { space: 7, up: 10, down: 10, left: 10, right: 10, owner: "you" },
          ],
          ["open", "samewall"],
        );

        const space = parseInt(key);
        const response = processFlips(game, space);
        expect(response).toHaveLength(2);
        expect(response[0].get(space)).toMatchObject({
          type: "place",
          direction: "none",
        });
        expect(response[1].get(4)).toMatchObject({
          type: "flip",
          direction: direction,
        });
      });
    },
  );
});

describe("elemental rule", () => {
  test("increase card stats and flip card", () => {
    const game = gameWithCardsInSpaces(
      [
        {
          space: 0,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "you",
          element: "Earth",
          spaceElement: "Earth",
        },
        {
          space: 1,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "opponent",
          element: "None",
          spaceElement: "None",
        },
      ],
      ["open", "elemental"],
    );
    const space = 0;

    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });

  test("decrease card stats and flip card", () => {
    const game = gameWithCardsInSpaces(
      [
        {
          space: 0,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "you",
          element: "None",
          spaceElement: "None",
        },
        {
          space: 1,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "opponent",
          element: "Earth",
          spaceElement: "Fire",
        },
      ],
      ["open", "elemental"],
    );
    const space = 0;

    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });

  test("placing a none card on an elemental should reduce it's stats", () => {
    const game = gameWithCardsInSpaces(
      [
        {
          space: 0,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "you",
          element: "None",
          spaceElement: "Fire",
        },
        {
          space: 1,
          up: 4,
          down: 4,
          left: 4,
          right: 4,
          owner: "opponent",
          element: "None",
          spaceElement: "None",
        },
      ],
      ["open", "elemental"],
    );
    const space = 0;

    const response = processFlips(game, space);
    expect(response).toHaveLength(1);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
  });
  test("placing an elemental card on an none should leave it's stats", () => {
    const game = gameWithCardsInSpaces(
      [
        {
          space: 0,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "you",
          element: "Fire",
          spaceElement: "None",
        },
        {
          space: 1,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "opponent",
          element: "None",
          spaceElement: "None",
        },
      ],
      ["open", "elemental"],
    );
    const space = 0;

    const response = processFlips(game, space);
    expect(response).toHaveLength(1);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
  });
  test("placing an elemental card on an none should leave it's stats and flip", () => {
    const game = gameWithCardsInSpaces(
      [
        {
          space: 0,
          up: 5,
          down: 5,
          left: 5,
          right: 5,
          owner: "you",
          element: "Fire",
          spaceElement: "None",
        },
        {
          space: 1,
          up: 4,
          down: 4,
          left: 4,
          right: 4,
          owner: "opponent",
          element: "None",
          spaceElement: "None",
        },
      ],
      ["open", "elemental"],
    );
    const space = 0;

    const response = processFlips(game, space);
    expect(response).toHaveLength(2);
    expect(response[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "left",
    });
  });
});

describe("basic flips", () => {
  const spaces: any[] = [
    { space: 4, up: 6, down: 6, left: 6, right: 6, owner: "you" },

    { space: 0, up: 6, down: 6, left: 6, right: 6, owner: "you" },
    { space: 2, up: 6, down: 6, left: 6, right: 6, owner: "you" },
    { space: 6, up: 6, down: 6, left: 6, right: 6, owner: "you" },
    { space: 8, up: 6, down: 6, left: 6, right: 6, owner: "you" },

    { space: 1, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
    { space: 3, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
    { space: 5, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
    { space: 7, up: 5, down: 5, left: 5, right: 5, owner: "opponent" },
  ];

  test("should flip the card next to it from centre", () => {
    const response = processFlips(gameWithCardsInSpaces(spaces, ["open"]), 4);
    expect(response).toHaveLength(2);
    expect(response[0].get(4)).toMatchObject({
      type: "place",
      direction: "none",
    });
    expect(response[1].get(1)).toMatchObject({
      type: "flip",
      direction: "down",
    });
    expect(response[1].get(3)).toMatchObject({
      type: "flip",
      direction: "right",
    });
    expect(response[1].get(5)).toMatchObject({
      type: "flip",
      direction: "left",
    });
    expect(response[1].get(7)).toMatchObject({ type: "flip", direction: "up" });
  });

  describe("in a corner", () => {
    test("should flip from top left", () => {
      const response = processFlips(gameWithCardsInSpaces(spaces, ["open"]), 0);
      expect(response).toHaveLength(2);
      expect(response[0].get(0)).toMatchObject({
        type: "place",
        direction: "none",
      });
      expect(response[1].get(1)).toMatchObject({
        type: "flip",
        direction: "left",
      });
      expect(response[1].get(3)).toMatchObject({
        type: "flip",
        direction: "up",
      });
    });

    test("should flip from top right", () => {
      const response = processFlips(gameWithCardsInSpaces(spaces, ["open"]), 2);
      expect(response).toHaveLength(2);
      expect(response[0].get(2)).toMatchObject({
        type: "place",
        direction: "none",
      });
      expect(response[1].get(1)).toMatchObject({
        type: "flip",
        direction: "right",
      });
      expect(response[1].get(5)).toMatchObject({
        type: "flip",
        direction: "up",
      });
    });

    test("should flip from bottom left", () => {
      const response = processFlips(gameWithCardsInSpaces(spaces, ["open"]), 6);
      expect(response).toHaveLength(2);
      expect(response[0].get(6)).toMatchObject({
        type: "place",
        direction: "none",
      });
      expect(response[1].get(3)).toMatchObject({
        type: "flip",
        direction: "down",
      });
      expect(response[1].get(7)).toMatchObject({
        type: "flip",
        direction: "left",
      });
    });

    test("should flip from bottom right", () => {
      const response = processFlips(gameWithCardsInSpaces(spaces, ["open"]), 8);
      expect(response).toHaveLength(2);
      expect(response[0].get(8)).toMatchObject({
        type: "place",
        direction: "none",
      });
      expect(response[1].get(5)).toMatchObject({
        type: "flip",
        direction: "down",
      });
      expect(response[1].get(7)).toMatchObject({
        type: "flip",
        direction: "right",
      });
    });
  });
});

describe("flipping a card", () => {
  test("should place the first card", () => {
    const result = calculateFlips(
      [
        { up: 5, down: 5, left: 5, right: 5, owner: "you" },
        { owner: "none" },
        { owner: "none" },
        { owner: "none" },
        { owner: "none" },
        { owner: "none" },
        { owner: "none" },
        { owner: "none" },
        { owner: "none" },
      ],
      0,
      [],
    );
    expect(result).toHaveLength(1);
    expect(result[0].get(0)).toMatchObject({
      type: "place",
      direction: "none",
    });
  });
});

const gameWithCardsInSpaces = (
  cards: {
    space: number;
    up: number;
    down: number;
    left: number;
    right: number;
    element?: CardElement;
    spaceElement?: CardElement;
    owner?: "you" | "opponent";
  }[],
  rules: GameRule[] = [],
) => {
  const board = Array(9)
    .fill({})
    .map((_, space) => {
      const c = cards.find((card) => card.space === space);
      let vcr = undefined;
      if (c) {
        vcr = {
          kind: 1,
          edition: "ff8",
          up: c.up,
          down: c.down,
          left: c.left,
          right: c.right,
          name: "test",
          element: c.element ?? "None",
        };
      }
      return {
        card: vcr,
        element: c?.spaceElement ?? "None",
        owner: c?.owner ?? "you",
      } as SpaceResponse;
    });

  const game: GameResponse = {
    id: "1",
    name: "test",
    description: "test",
    state: "InProgress",
    you: {
      id: "1",
      name: "test",
      emailHash: "test",
      score: 0,
      cards: [],
    },
    opponent: {
      id: "1",
      name: "test",
      emailHash: "test",
      score: 0,
      cards: [],
    },
    isYourTurn: true,
    turnEndsAt: new Date(),
    board: board,
    rules: rules,
    tradeRule: "none",
  };

  return game;
};
