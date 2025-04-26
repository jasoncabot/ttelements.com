import { CardPlayedResponse, GameResponse, GameRule } from "./games";

export interface Change {
  type: "place" | "flip";
  direction: "none" | "up" | "down" | "left" | "right";
}

export type Position = number;

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
  space: number,
) => CardPlayedResponse = (game, space) => {
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
  rules: GameRule[],
) => {
  const updates: Record<Position, Change> = {};

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
      updates[space - 3] = { type: "flip", direction: "down" };
      if (cardAbove) cardAbove.owner = playedCard.owner;
    }

    if (sameDown && (sameUp || sameLeft || sameRight)) {
      updates[space + 3] = { type: "flip", direction: "up" };
      if (cardBelow) cardBelow.owner = playedCard.owner;
    }

    if (sameLeft && (sameUp || sameDown || sameRight)) {
      updates[space - 1] = { type: "flip", direction: "right" };
      if (cardLeft) cardLeft.owner = playedCard.owner;
    }

    if (sameRight && (sameUp || sameDown || sameLeft)) {
      updates[space + 1] = { type: "flip", direction: "left" };
      if (cardRight) cardRight.owner = playedCard.owner;
    }
  }

  if (rules.includes("plus") || rules.includes("pluswall")) {
    const sumUp = cardAbove?.down
      ? cardAbove.down + playedCard.up!
      : rules.includes("pluswall")
        ? playedCard.up! + 10
        : undefined;
    const sumDown = cardBelow?.up
      ? cardBelow.up + playedCard.down!
      : rules.includes("pluswall")
        ? playedCard.down! + 10
        : undefined;
    const sumLeft = cardLeft?.right
      ? cardLeft.right + playedCard.left!
      : rules.includes("pluswall")
        ? playedCard.left! + 10
        : undefined;
    const sumRight = cardRight?.left
      ? cardRight.left + playedCard.right!
      : rules.includes("pluswall")
        ? playedCard.right! + 10
        : undefined;

    if (
      sumUp &&
      (sumLeft === sumUp || sumDown === sumUp || sumRight === sumUp)
    ) {
      updates[space - 3] = { type: "flip", direction: "down" };
      if (cardAbove) cardAbove.owner = playedCard.owner;
    }

    if (
      sumDown &&
      (sumUp === sumDown || sumLeft === sumDown || sumRight === sumDown)
    ) {
      updates[space + 3] = { type: "flip", direction: "up" };
      if (cardBelow) cardBelow.owner = playedCard.owner;
    }

    if (
      sumLeft &&
      (sumUp === sumLeft || sumDown === sumLeft || sumRight === sumLeft)
    ) {
      updates[space - 1] = { type: "flip", direction: "right" };
      if (cardLeft) cardLeft.owner = playedCard.owner;
    }

    if (
      sumRight &&
      (sumUp === sumRight || sumDown === sumRight || sumLeft === sumRight)
    ) {
      updates[space + 1] = { type: "flip", direction: "left" };
      if (cardRight) cardRight.owner = playedCard.owner;
    }
  }

  return updates;
};

const doBasicFlipsForSpace = (board: CardInSpace[], space: number) => {
  const updates: Record<Position, Change> = {};

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
      updates[space + 1] = { type: "flip", direction: "left" };
      board[space + 1].owner = playedCard.owner;
    }
  }

  if (
    playedCard.left &&
    cardLeft?.right &&
    playedCard.owner !== cardLeft.owner
  ) {
    if (playedCard.left > cardLeft.right) {
      updates[space - 1] = { type: "flip", direction: "right" };
      board[space - 1].owner = playedCard.owner;
    }
  }

  if (
    playedCard.up &&
    cardAbove?.down &&
    playedCard.owner !== cardAbove.owner
  ) {
    if (playedCard.up > cardAbove.down) {
      updates[space - 3] = { type: "flip", direction: "down" };
      board[space - 3].owner = playedCard.owner;
    }
  }

  if (
    playedCard.down &&
    cardBelow?.up &&
    playedCard.owner !== cardBelow.owner
  ) {
    if (playedCard.down > cardBelow.up) {
      updates[space + 3] = { type: "flip", direction: "up" };
      board[space + 3].owner = playedCard.owner;
    }
  }

  return updates;
};

const calculateFlips: (
  board: CardInSpace[],
  space: number,
  rules: GameRule[],
) => CardPlayedResponse = (
  board: CardInSpace[],
  space: number,
  rules: GameRule[],
) => {
  const touchedSpaces = new Set<Position>();

  const firstPlay: Record<Position, Change> = {};
  firstPlay[space] = { type: "place", direction: "none" };

  const response: CardPlayedResponse = [firstPlay];

  // check special flips
  const specialFlips = doSpecialFlipsForSpace(board, space, rules);
  if (Object.keys(specialFlips).length > 0) {
    response.push(specialFlips);
    touchedSpaces.add(space);

    // calculate combos
    if (rules.includes("combo")) {
      const allMergedComboFlips = (touchingSpaces: Iterable<number>) => {
        const mergedFlips: Record<Position, Change> = {};

        for (const space of touchingSpaces) {
          if (touchedSpaces.has(space)) continue;

          const flips = doBasicFlipsForSpace(board, space);
          Object.entries(flips).forEach(([space, change]) => {
            touchedSpaces.add(Number(space));
            mergedFlips[Number(space)] = change;
          });
        }
        return Object.keys(mergedFlips).length > 0 ? mergedFlips : undefined;
      };

      // start by finding all the special flips
      let comboFlips = allMergedComboFlips(
        Object.keys(specialFlips).map(Number).values(),
      );
      while (comboFlips != undefined) {
        response.push(comboFlips);
        // Find the next set of combo flips
        comboFlips = allMergedComboFlips(
          Object.keys(comboFlips).map(Number).values(),
        );
      }
    }
  }

  // check basic flips
  if (!touchedSpaces.has(space)) {
    const basicFlips = doBasicFlipsForSpace(board, space);
    if (Object.keys(basicFlips).length > 0) {
      response.push(basicFlips);
      touchedSpaces.add(space);
    }
  }

  return response;
};

export { calculateFlips, processFlips };
