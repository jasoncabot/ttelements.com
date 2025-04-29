import { CardEdition, CardElement } from "./cards";
import { Change, Position } from "./flips";

export type GameState =
  | "WaitingForOpponent"
  | "PickInProgress"
  | "WaitingForOtherPlayer"
  | "InProgress"
  | "Trading"
  | "Completed";

export enum OpponentType {
  Computer = "computer",
  Public = "public",
  Private = "private",
}

export type CreateRequest = {
  opponent: OpponentType;
  rules: GameRule[];
  tradeRule: GameTradeRule;
};

export type JoinRequest = object;

export type JoinableGame = {
  id: string;
  creator: string;
  createdAt: string;
  rules: GameRule[];
  tradeRule: GameTradeRule;
};

export type GameResponse = {
  id: string;
  name: string;
  description: string;
  state: GameState;
  you: PlayerResponse;
  opponent: PlayerResponse;
  isYourTurn: boolean;
  turnEndsAt: Date;
  board: SpaceResponse[];
  rules: GameRule[];
  tradeRule: GameTradeRule;
};

export type PlayerResponse = {
  id: string;
  name: string;
  emailHash: string;
  score: number;
  cards: CardResponse[];
};

export type ViewableCardResponse = {
  kind: number;
  edition: CardEdition;
  up: number;
  down: number;
  left: number;
  right: number;
  name: string;
  element: CardElement;
};

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
export type CardPlayedResponse = Record<Position, Change>[];
export type GameUpdateByCardResponse = {
  changes: CardPlayedResponse;
  finalState: GameResponse;
};

export type CardResponse = {
  hidden: boolean;
  played: boolean;
  card?: ViewableCardResponse;
  chosen: boolean;
};

export type SpaceResponse = {
  card?: ViewableCardResponse;
  element: CardElement;
  owner: "you" | "opponent" | "empty";
};

export type PlayCardRequest = {
  space: number;
  cardIndex: number;
};

export type ChooseCardsRequest = {
  cards: { kind: number; edition: CardEdition }[];
};

export type TradeCardsRequest = {
  cards: { kind: number; edition: CardEdition }[];
};

// things that a user can do in a game: (commands)
// - join a game
// - confirm the set of cards they want to play with
// - play a card
// - choose card(s) to trade
export type GameCommand = {
  type: "join" | "choose-cards" | "play-card" | "trade-cards";
  data: JoinRequest | ChooseCardsRequest | PlayCardRequest | TradeCardsRequest;
};

// things that can happen in a game: (events)
// - state changed
// - card played
export type GameEvent =
  | {
      type: "state-changed";
      data: GameResponse;
    }
  | {
      type: "card-played";
      data: GameUpdateByCardResponse;
    }
  | {
      type: "error";
      data: string;
    };

export type GameTradeRule = "none" | "one" | "direct" | "all";

export type GameRule =
  | "open"
  | "random"
  | "same"
  | "plus"
  | "samewall"
  | "pluswall"
  | "combo"
  | "elemental";
