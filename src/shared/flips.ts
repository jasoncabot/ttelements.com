import { GameResponse, GameRule } from "./games";

interface Change {
  type: "place" | "flip";
  direction: "none" | "up" | "down" | "left" | "right";
}

export type Position = number;

// The order in which the changes happen is defined by the array
// for example the following defines a card played in the top left space
// the flips the 2 cards touching it to the left and below it
// these in turn then flip the card in the center

/*

    | 0*| 1 | 2 |
    | 3 | 4 | 5 |
    | 6 | 7 | 8 |

    | 0 | 1*| 2 |
    | 3*| 4 | 5 |
    | 6 | 7 | 8 |

    | 0 | 1 | 2 |
    | 3 | 4*| 5 |
    | 6 | 7 | 8 |

[
    { 
        0: { type: "place", direction: "none" } 
    },
    {
        1: { type: "flip", direction: "left" },
        3: { type: "flip", direction: "up" },
    },
    { 
        4: { type: "flip", direction: "left" } 
    }
]

*/
export type GameUpdateResponse = Map<Position, Change>[];

// A smaller version of the Card with values calculated after elemental has been applied
interface CardInSpace {
  owner: "none" | "you" | "opponent";
  up?: number;
  down?: number;
  left?: number;
  right?: number;
}

const processFlips: (
  game: GameResponse,
  space: number
) => GameUpdateResponse = (game, space) => {
  const { board, rules } = game;

  // calculate an array of CardInSpace
  const elemental = rules.includes("elemental");
  const cardsInSpaces: CardInSpace[] = board.map((space) => {
    if (!space.card) {
      return { owner: "none" } as CardInSpace;
    }

    // if there is no element, or we haven't got elemental enabled
    if (!elemental || !space.element || space.element === "None") {
      return {
        up: space.card.up,
        down: space.card.down,
        left: space.card.left,
        right: space.card.right,
        owner: space.owner,
      } as CardInSpace;
    } else {
      // space has an element and elemental is enabled
      const modifier = space.element === space.card.element ? 1 : -1;
      return {
        up: space.card.up + modifier,
        down: space.card.down + modifier,
        left: space.card.left + modifier,
        right: space.card.right + modifier,
        owner: space.owner,
      } as CardInSpace;
    }
  });

  return calculateFlips(cardsInSpaces, space, rules);
};

const doSpecialFlipsForSpace = (
  board: CardInSpace[],
  space: number,
  rules: GameRule[]
) => {
  const updates: Map<Position, Change> = new Map();

  const playedCard = board[space];

  const cardAbove = space < 3 ? undefined : board[space - 3];
  const cardBelow = space > 5 ? undefined : board[space + 3];
  const cardLeft = space % 3 === 0 ? undefined : board[space - 1];
  const cardRight = space % 3 === 2 ? undefined : board[space + 1];

  if (rules.includes("same") || rules.includes("samewall")) {
    const sameUp =
      playedCard.up === cardAbove?.down ||
      (rules.includes("samewall") &&
        cardAbove === undefined &&
        playedCard.up === 10);
    const sameDown =
      playedCard.down === cardBelow?.up ||
      (rules.includes("samewall") &&
        cardBelow === undefined &&
        playedCard.down === 10);
    const sameLeft =
      playedCard.left === cardLeft?.right ||
      (rules.includes("samewall") &&
        cardLeft === undefined &&
        playedCard.left === 10);
    const sameRight =
      playedCard.right === cardRight?.left ||
      (rules.includes("samewall") &&
        cardRight === undefined &&
        playedCard.right === 10);

    if (sameUp && (sameLeft || sameDown || sameRight)) {
      updates.set(space - 3, { type: "flip", direction: "down" });
      if (cardAbove) cardAbove.owner = playedCard.owner;
    }

    if (sameDown && (sameUp || sameLeft || sameRight)) {
      updates.set(space + 3, { type: "flip", direction: "up" });
      if (cardBelow) cardBelow.owner = playedCard.owner;
    }

    if (sameLeft && (sameUp || sameDown || sameRight)) {
      updates.set(space - 1, { type: "flip", direction: "right" });
      if (cardLeft) cardLeft.owner = playedCard.owner;
    }

    if (sameRight && (sameUp || sameDown || sameLeft)) {
      updates.set(space + 1, { type: "flip", direction: "left" });
      if (cardRight) cardRight.owner = playedCard.owner;
    }
  }

  if (rules.includes("plus") || rules.includes("pluswall")) {

    const sumUp = cardAbove?.down ? cardAbove.down + playedCard.up! : (rules.includes("pluswall") ? playedCard.up! + 10 : undefined);
    const sumDown = cardBelow?.up ? cardBelow.up + playedCard.down! : (rules.includes("pluswall") ? playedCard.down! + 10 : undefined);
    const sumLeft = cardLeft?.right ? cardLeft.right + playedCard.left! : (rules.includes("pluswall") ? playedCard.left! + 10 : undefined);
    const sumRight = cardRight?.left ? cardRight.left + playedCard.right! : (rules.includes("pluswall") ? playedCard.right! + 10 : undefined);

    if (sumUp && (sumLeft === sumUp || sumDown === sumUp || sumRight === sumUp)) {
      updates.set(space - 3, { type: "flip", direction: "down" });
      if (cardAbove) cardAbove.owner = playedCard.owner;
    }

    if (sumDown && (sumUp === sumDown || sumLeft === sumDown || sumRight === sumDown)) {
      updates.set(space + 3, { type: "flip", direction: "up" });
      if (cardBelow) cardBelow.owner = playedCard.owner;
    }

    if (sumLeft && (sumUp === sumLeft || sumDown === sumLeft || sumRight === sumLeft)) {
      updates.set(space - 1, { type: "flip", direction: "right" });
      if (cardLeft) cardLeft.owner = playedCard.owner;
    }

    if (sumRight && (sumUp === sumRight || sumDown === sumRight || sumLeft === sumRight)) {
      updates.set(space + 1, { type: "flip", direction: "left" });
      if (cardRight) cardRight.owner = playedCard.owner;
    }
  }

  return updates;
};

const doBasicFlipsForSpace = (board: CardInSpace[], space: number) => {
  const updates: Map<Position, Change> = new Map();

  // calculate flips for this space
  const playedCard = board[space];

  const cardAbove = space < 3 ? undefined : board[space - 3];
  const cardBelow = space > 5 ? undefined : board[space + 3];
  const cardLeft = space % 3 === 0 ? undefined : board[space - 1];
  const cardRight = space % 3 === 2 ? undefined : board[space + 1];

  if (
    playedCard.right &&
    cardRight?.left &&
    playedCard.owner !== cardRight.owner
  ) {
    if (playedCard.right > cardRight.left) {
      updates.set(space + 1, { type: "flip", direction: "left" });
      board[space + 1].owner = playedCard.owner;
    }
  }

  if (
    playedCard.left &&
    cardLeft?.right &&
    playedCard.owner !== cardLeft.owner
  ) {
    if (playedCard.left > cardLeft.right) {
      updates.set(space - 1, { type: "flip", direction: "right" });
      board[space - 1].owner = playedCard.owner;
    }
  }

  if (
    playedCard.up &&
    cardAbove?.down &&
    playedCard.owner !== cardAbove.owner
  ) {
    if (playedCard.up > cardAbove.down) {
      updates.set(space - 3, { type: "flip", direction: "down" });
      board[space - 3].owner = playedCard.owner;
    }
  }

  if (
    playedCard.down &&
    cardBelow?.up &&
    playedCard.owner !== cardBelow.owner
  ) {
    if (playedCard.down > cardBelow.up) {
      updates.set(space + 3, { type: "flip", direction: "up" });
      board[space + 3].owner = playedCard.owner;
    }
  }

  return updates;
};

const calculateFlips: (
  board: CardInSpace[],
  space: number,
  rules: GameRule[]
) => GameUpdateResponse = (
  board: CardInSpace[],
  space: number,
  rules: GameRule[]
) => {
  const touchedSpaces = new Set<Position>();

  const firstPlay = new Map<Position, Change>();
  firstPlay.set(space, { type: "place", direction: "none" });

  const response: GameUpdateResponse = [firstPlay];

  // check special flips
  const specialFlips = doSpecialFlipsForSpace(board, space, rules);
  if (specialFlips.size > 0) {
    response.push(specialFlips);
    touchedSpaces.add(space);

    // calculate combos
    if (rules.includes("combo")) {
      const allMergedComboFlips = (
        touchingSpaces: IterableIterator<number>
      ) => {
        const mergedFlips: Map<Position, Change> = new Map();

        for (let space of touchingSpaces) {
          if (touchedSpaces.has(space)) continue;

          const flips = doBasicFlipsForSpace(board, space);
          flips.forEach((change, space) => {
            touchedSpaces.add(space);
            mergedFlips.set(space, change);
          });
        }
        return mergedFlips.size > 0 ? mergedFlips : undefined;
      };

      // start by finding all the special flips
      let comboFlips = allMergedComboFlips(specialFlips.keys());
      while (comboFlips != undefined) {
        response.push(comboFlips);
        // Find the next set of combo flips
        comboFlips = allMergedComboFlips(comboFlips.keys());
      }
    }
  }

  // check basic flips
  if (!touchedSpaces.has(space)) {
    const basicFlips = doBasicFlipsForSpace(board, space);
    if (basicFlips.size > 0) {
      response.push(basicFlips);
      touchedSpaces.add(space);
    }
  }

  return response;
};

export { processFlips, calculateFlips };
