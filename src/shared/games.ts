import { CardEdition, CardElement } from "./cards";

export type GameState =
  | "WaitingForOpponent"
  | "PickInProgress"
  | "WaitingForOtherPlayer"
  | "InProgress"
  | "Trading"
  | "Completed";

export type CreateRequest = {
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

export type CardResponse = {
  hidden: boolean;
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

export type CardPlayedEvent = {
  space: number;
  card: ViewableCardResponse;
};

// things that can happen in a game: (events)
// - state changed
// - card played
export type GameEvent = {
  type: "state-changed" | "card-played" | "error";
  data: GameResponse | CardPlayedEvent | string;
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
