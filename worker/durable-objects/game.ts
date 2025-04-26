import { DurableObject } from "cloudflare:workers";

import { error, json } from "itty-router";
import {
  CardEdition,
  CardElement,
  CardResponse,
  ChooseCardsRequest,
  CreateRequest,
  GameCommand,
  GameEvent,
  GameResponse,
  GameRule,
  GameState,
  GameTradeRule,
  JoinableGame,
  OwnedCardResponse,
  PlayCardRequest,
  SpaceResponse,
  TradeCardsRequest,
  ViewableCardResponse,
  processFlips,
} from "../../src/shared";
import { CardPlayedResponse, OpponentType } from "../../src/shared/games";
import { listOwnedCardsAction } from "./card-collection";

export const createGameAction = (
  userId: string,
  userName: string,
  emailHash: string,
) =>
  `${durableObjectGameAction("create")}&userId=${userId}&userName=${userName}&emailHash=${emailHash}`;
export const showGameAction = (userId: string) =>
  `${durableObjectGameAction("show")}&userId=${userId}`;
export const joinGameAction = (
  userId: string,
  userName: string,
  emailHash: string,
) =>
  `${durableObjectGameAction("join")}&userId=${userId}&userName=${userName}&emailHash=${emailHash}`;
export const playCardInGameAction = (userId: string) =>
  `${durableObjectGameAction("play-card")}&userId=${userId}`;
export const chooseCardsInGameAction = (userId: string) =>
  `${durableObjectGameAction("choose-cards")}&userId=${userId}`;
export const tradeCardsInGameAction = (userId: string) =>
  `${durableObjectGameAction("trade-cards")}&userId=${userId}`;
export const openSocketGameAction = (token: string) =>
  `${durableObjectGameAction("open-ws")}&token=${token}`;

const updateGameDetailsAction = (gameId: string) =>
  `${durableObjectGameAction("update-details")}&id=${gameId}`;
const listJoinGameAction = (
  gameId: string,
  creatorId: string,
  joinerId: string,
) =>
  `${durableObjectGameAction("list-join")}&id=${gameId}&creator_id=${creatorId}&joiner_id=${joinerId}`;
const listEndGameAction = (
  gameId: string,
  creatorId: string,
  joinerId: string,
) =>
  `${durableObjectGameAction("list-game-over")}&id=${gameId}&creator_id=${creatorId}&joiner_id=${joinerId}`;

type GameAction =
  | "create"
  | "show"
  | "join"
  | "open-ws"
  | "play-card"
  | "update-details"
  | "list-join"
  | "list-game-over"
  | "choose-cards"
  | "trade-cards";

const durableObjectGameAction = (type: GameAction) => {
  return `https://game?action=${type}`;
};

export interface CardEntry {
  kind: number;
  edition: CardEdition;
  name: string;
  up: number;
  down: number;
  left: number;
  right: number;
  element: CardElement;
}

interface SpaceEntry {
  card?: CardEntry;
  element: CardElement;
  playerId?: string;
}

interface PlayerEntry {
  id: string;
  name: string;
  emailHash: string;
  score: number;
  cards: CardEntry[];
  playedIndexes: number[];
}

interface GameEntry {
  id: string;
  state: GameState;
  players: PlayerEntry[];
  turn: number;
  turnEndsAt: Date;
  board: SpaceEntry[];
  rules: GameRule[];
  tradeRule: GameTradeRule;
}

export interface Connection {
  socket: WebSocket;
  quitting: boolean;
  userId: string;
  userName: string;
  emailHash: string;
}

export interface TokenEntry {
  userId: string;
  gameId: string;
  userName: string;
  emailHash: string;
}

type SocketToken = string;

export class Game extends DurableObject<Env> {
  private connections: Map<SocketToken, Connection>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.connections = new Map();
  }

  async listGames(userId: string): Promise<JoinableGame[]> {
    // list all games that are in progress for this user
    const gameRecords = await this.ctx.storage.list<JoinableGame>({
      prefix: `u:${userId}:in-progress`,
    });
    const games: JoinableGame[] = [];
    gameRecords.forEach((g) => {
      games.push(g);
    });
    return games;
  }

  async listOpenGames(): Promise<JoinableGame[]> {
    // list all games that are open
    const gameRecords = await this.ctx.storage.list<JoinableGame>({
      prefix: "open",
    });
    const games: JoinableGame[] = [];
    gameRecords.forEach((g) => {
      games.push(g);
    });
    return games;
  }

  async fetch(request: Request): Promise<Response> {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const action = searchParams.get("action") as GameAction;

    switch (action) {
      case "create": {
        const userId = searchParams.get("userId")!;
        const userName = searchParams.get("userName")!;
        const emailHash = searchParams.get("emailHash")!;
        const req = (await request.json()) as CreateRequest;

        try {
          const game = await handleCreate(
            this.ctx,
            this.env,
            this.connections.values(),
            req,
            userId,
            userName,
            emailHash,
          );
          return json(playerView(game, userId), { status: 201 });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          return error(e.message);
        }
      }
      case "show": {
        const userId = searchParams.get("userId")!;

        const game = await this.ctx.storage.get<GameEntry>("entry");
        if (game) {
          return json(playerView(game, userId));
        } else {
          return error(404, "game not found");
        }
      }
      case "join": {
        const userId = searchParams.get("userId")!;
        const userName = searchParams.get("userName")!;
        const emailHash = searchParams.get("emailHash")!;

        try {
          const result = await handleJoin(
            this.ctx,
            this.env,
            this.connections.values(),
            userId,
            userName,
            emailHash,
          );
          return json(result);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          return error(e.message);
        }
      }
      case "choose-cards": {
        const userId = searchParams.get("userId")!;
        const req = (await request.json()) as ChooseCardsRequest;

        try {
          const result = await handleChooseCards(
            this.ctx,
            this.env,
            this.connections.values(),
            req,
            userId,
          );
          return json(result);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          return error(e.message);
        }
      }
      case "play-card": {
        const userId = searchParams.get("userId")!;
        const req = (await request.json()) as PlayCardRequest;

        try {
          const result = await handlePlayCard(
            this.ctx,
            this.env,
            this.connections.values(),
            req,
            userId,
          );
          return json(result);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          return error(e.message);
        }
      }
      case "trade-cards": {
        const userId = searchParams.get("userId")!;
        const req = (await request.json()) as TradeCardsRequest;

        try {
          const result = await handleTradeCards(
            this.ctx,
            this.env,
            this.connections.values(),
            req,
            userId,
          );
          return json(result);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          return error(e.message);
        }
      }
      case "list-join": {
        // transition the game from being open and associated with the global user
        // to in progress and associated with the two players
        const creatorId = searchParams.get("creator_id")!;
        const joinerId = searchParams.get("joiner_id")!;
        const gameId = searchParams.get("id")!;
        try {
          const game = await this.ctx.storage.get<JoinableGame>(
            `u:${creatorId}:open:${gameId}`,
          );

          this.ctx.storage.put(`u:${creatorId}:in-progress:${gameId}`, game);
          this.ctx.storage.put(`u:${joinerId}:in-progress:${gameId}`, game);
          this.ctx.storage.delete(`u:${creatorId}:open:${gameId}`);
          this.ctx.storage.delete(`open:${gameId}`);
          return json(game, { status: 200 });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          return error(404, "game not found");
        }
      }
      case "list-game-over": {
        this.ctx.storage.delete(
          `u:${searchParams.get("creator_id")!}:in-progress:${searchParams.get("id")!}`,
        );
        this.ctx.storage.delete(
          `u:${searchParams.get("joiner_id")!}:in-progress:${searchParams.get("id")!}`,
        );
        return json({}, { status: 200 });
      }
      case "update-details": {
        const game: GameEntry = await request.json<GameEntry>();
        this.ctx.storage.put<GameEntry>("entry", game);
        return json(game, { status: 201 });
      }
      case "open-ws": {
        const token = searchParams.get("token");
        if (!token) {
          return error(400, "expected token");
        }

        const socketToken = (await this.env.SOCKET_TOKENS.get(
          token,
          "json",
        )) as TokenEntry;
        if (!socketToken || !socketToken.gameId || !socketToken.userId) {
          return error(401, "invalid token");
        }

        const game = await this.ctx.storage.get<GameEntry>("entry");
        if (!game) {
          return error(404, "game not found");
        }

        if (game.id !== socketToken.gameId) {
          return error(401, "invalid game id");
        }

        const [client, server] = Object.values(new WebSocketPair());

        await this.handleSession(
          server,
          token,
          socketToken.userId,
          socketToken.userName,
          socketToken.emailHash,
        );

        // consume this token so it can't be re-used
        this.env.SOCKET_TOKENS.delete(token);

        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      }

      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ((_: never) => {
          throw new Error("Should handle every state");
        })(action);
    }
  }

  handleSession(
    socket: WebSocket,
    token: string,
    userId: string,
    userName: string,
    emailHash: string,
  ) {
    socket.accept();

    const connection = {
      socket,
      quitting: false,
      userId: userId,
      userName: userName,
      emailHash: emailHash,
    } as Connection;
    this.connections.set(token, connection);

    socket.addEventListener("message", async (msg) => {
      const command = JSON.parse(msg.data as string) as GameCommand;

      try {
        switch (command.type) {
          case "choose-cards":
            await handleChooseCards(
              this.ctx,
              this.env,
              this.connections.values(),
              command.data as ChooseCardsRequest,
              userId,
            );
            break;
          case "play-card":
            await handlePlayCard(
              this.ctx,
              this.env,
              this.connections.values(),
              command.data as PlayCardRequest,
              userId,
            );
            break;
          case "join":
            await handleJoin(
              this.ctx,
              this.env,
              this.connections.values(),
              userId,
              userName,
              emailHash,
            );
            break;
          case "trade-cards":
            await handleTradeCards(
              this.ctx,
              this.env,
              this.connections.values(),
              command.data as TradeCardsRequest,
              userId,
            );
            break;
        }
      } catch (e: unknown) {
        if (!(e instanceof Error)) {
          console.error("Error in game command", e);
          return;
        }
        const error = { type: "error", data: e.message };
        socket.send(JSON.stringify(error));
      }
    });

    // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
    // a quit message.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const closeOrErrorHandler = (_event: CloseEvent | MessageEvent | Event) => {
      // since the server can detect when a socket is closed rather than our clients
      // use this to inform other players we've left, using the LeaveCommand/LeaveEvent methodology
      connection.quitting = true;
    };
    socket.addEventListener("close", closeOrErrorHandler);
    socket.addEventListener("error", closeOrErrorHandler);
  }

  async handleErrors(request: Request, func: () => Promise<Response>) {
    try {
      return await func();
    } catch (err: unknown) {
      if (!(err instanceof Error)) {
        console.error("Error in game command", err);
        return;
      }
      if (request.headers.get("Upgrade") == "websocket") {
        // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
        // won't show us the response body! So... let's send a WebSocket response with an error
        // frame instead.
        const pair = new WebSocketPair();
        pair[1].accept();
        pair[1].send(JSON.stringify({ error: err.stack }));
        pair[1].close(1011, "Uncaught exception during session setup");
        return new Response(null, { status: 101, webSocket: pair[0] });
      } else {
        return new Response(err.stack, { status: 500 });
      }
    }
  }
}

const playerView = (game: GameEntry, userId: string) => {
  // convert our GameEntry to a GameResponse by looking at the user id
  // and only returning the information that the user is allowed to see

  const youIndex = game.players.findIndex((p) => p.id === userId);
  const opponentIndex = game.players.findIndex((p) => p.id !== userId);
  const you = youIndex > -1 ? game.players[youIndex] : undefined;
  const opponent = opponentIndex > -1 ? game.players[opponentIndex] : undefined;

  const toCardResponse = (
    card: CardEntry,
    hidden: boolean,
    chosen: boolean,
  ) => {
    if (hidden) {
      return {
        hidden: true,
        chosen: chosen,
      } as CardResponse;
    }

    return {
      hidden: false,
      card: toViewableCard(card),
      chosen: chosen,
    } as CardResponse;
  };

  const toViewableCard = (card: CardEntry) => {
    return {
      kind: card.kind,
      edition: card.edition,
      up: card.up,
      down: card.down,
      left: card.left,
      right: card.right,
      name: card.name,
      element: card.element,
    } as ViewableCardResponse;
  };

  const toSpaceResponse = (space: SpaceEntry, userId: string) => {
    if (!space.playerId || !space.card)
      return { owner: "empty" } as SpaceResponse;

    return {
      // only set card if it's not undefined
      card: space.card ? toViewableCard(space.card) : undefined,
      element: space.element,
      owner: space.playerId === userId ? "you" : "opponent",
    } as SpaceResponse;
  };

  // if the game is open then you can see your opponent's cards
  // otherwise you can only see the back of their cards
  // but only if both players have chosen their cards
  const canSeeOpponentsCards =
    game.rules.includes("open") &&
    ["InProgress", "Trading", "Completed"].includes(game.state);

  const youPlayedCards = you?.playedIndexes || [];
  const yourCards: CardResponse[] =
    you?.cards.map((card, index) =>
      toCardResponse(card, youPlayedCards.includes(index), true),
    ) || [];
  for (let i = yourCards.length; i < 5; i++) {
    yourCards.push(toCardResponse({} as CardEntry, true, false));
  }
  const hidden = !canSeeOpponentsCards;
  const opponentPlayedCards = opponent?.playedIndexes || [];
  const opponentCards: CardResponse[] =
    opponent?.cards.map((card, index) =>
      toCardResponse(card, opponentPlayedCards.includes(index) || hidden, true),
    ) || [];
  for (let i = opponentCards.length; i < 5; i++) {
    opponentCards.push(toCardResponse({} as CardEntry, true, false));
  }
  return {
    id: game.id,
    state: game.state,
    you: {
      id: you?.id,
      name: you?.name,
      emailHash: you?.emailHash,
      score: you?.score,
      cards: yourCards,
    },
    opponent: {
      id: opponent?.id,
      name: opponent?.name,
      emailHash: opponent?.emailHash,
      score: opponent?.score,
      cards: opponentCards,
    },
    isYourTurn: game.turn === youIndex,
    turnEndsAt: game.turnEndsAt,
    board: game.board.map((space) => toSpaceResponse(space, userId)),
    rules: game.rules,
    tradeRule: game.tradeRule,
  } as GameResponse;
};

const onGameStateChange = (
  game: GameEntry,
  connections: IterableIterator<Connection>,
) => {
  // send the game state to all players
  for (const connection of connections) {
    const data: GameResponse = playerView(game, connection.userId);
    const event: GameEvent = {
      type: "state-changed",
      data: data,
    };
    connection.socket.send(JSON.stringify(event));
  }
};

const onCardPlayed = (
  game: GameEntry,
  flipResponse: CardPlayedResponse,
  connections: IterableIterator<Connection>,
) => {
  for (const connection of connections) {
    const event: GameEvent = {
      type: "card-played",
      data: {
        changes: flipResponse,
        finalState: playerView(game, connection.userId),
      },
    };
    connection.socket.send(JSON.stringify(event));
  }
};

const handlePlayCard = async (
  state: DurableObjectState,
  env: Env,
  connections: IterableIterator<Connection>,
  req: PlayCardRequest,
  userId: string,
) => {
  const game = await state.storage.get<GameEntry>("entry");
  if (!game || !game?.players.find((p) => p.id === userId)) {
    throw new Error("Not in game");
  }

  const player = game.players[game.turn];
  const myTurn = player.id === userId;
  if (!myTurn) {
    throw new Error("Not your turn");
  }

  if (game.board[req.space].card) {
    throw new Error("Space already occupied");
  }

  const card = player.cards[req.cardIndex];
  // if there's no card, or the player has already played it, then it's invalid
  if (!card || player.playedIndexes.includes(req.cardIndex)) {
    throw new Error("Invalid card");
  }
  player.playedIndexes.push(req.cardIndex);

  game.board[req.space] = {
    card: card,
    playerId: userId,
    element: game.board[req.space].element,
  };

  const flipResponse = processFlips(playerView(game, userId), req.space);
  flipResponse.forEach((changes) => {
    Object.entries(changes).forEach(([spaceStr, change]) => {
      const space = parseInt(spaceStr, 10);
      if (change.type === "flip") {
        player.score++;
        const opponent = game.players[(game.turn + 1) % game.players.length];
        opponent.score--;

        game.board[space].playerId = player.id;
      }
    });
  });

  game.turn = (game.turn + 1) % game.players.length;
  game.turnEndsAt = new Date();
  game.turnEndsAt.setMinutes(game.turnEndsAt.getMinutes() + 5);
  const spacesRemain = game.board.some((space) => !space.card);
  if (!spacesRemain) {
    // transition the game depending on the trade rule
    if (["none", "direct", "all"].some((i) => game.tradeRule === i)) {
      game.state = "Completed";
    } else {
      game.state = "Trading";
    }
  }
  state.storage.put("entry", game);

  if (game.state === "Completed") {
    const id = env.GAME.idFromName("global");
    const obj = env.GAME.get(id);
    obj.fetch(
      listEndGameAction(game.id, game.players[0].id, game.players[1].id),
      { method: "POST" },
    );
  }

  onCardPlayed(game, flipResponse, connections);

  return playerView(game, userId);
};

const handleChooseCards = async (
  state: DurableObjectState,
  env: Env,
  connections: IterableIterator<Connection>,
  request: ChooseCardsRequest,
  userId: string,
) => {
  const game = await state.storage.get<GameEntry>("entry");
  if (
    !game ||
    !["PickInProgress", "WaitingForOtherPlayer"].includes(game.state)
  ) {
    throw new Error("Game not found or not in choosing cards state");
  }

  if (request.cards.length !== 5) {
    throw new Error("Must choose 5 cards");
  }

  // Get the users cards
  const cardCollectionId = env.CARD_COLLECTION.idFromName("global");
  const cardCollection = env.CARD_COLLECTION.get(cardCollectionId);
  const cardResponse = await cardCollection
    .fetch(listOwnedCardsAction(userId), {
      method: "POST",
    })
    .then((r) => r.json() as Promise<OwnedCardResponse>)
    .then((c: OwnedCardResponse) => c.entries.map((e) => e.card));

  // set the current players cards to be whatever has been chosen from the request
  const playerIndex = game.players.findIndex((p) => p.id === userId);
  game.players[playerIndex].cards = request.cards.map((card) => {
    // find the matching card in cardResponse
    const matchingCard = cardResponse.findIndex(
      (c) => c.edition === card.edition && c.kind === card.kind,
    );
    if (matchingCard < 0) {
      throw new Error("Must choose 5 cards you own");
    }

    const selectedCard = cardResponse[matchingCard];

    // remove matching card from card response
    cardResponse.splice(matchingCard, 1);

    return selectedCard as CardEntry;
  });

  game.turn = (game.turn + 1) % game.players.length;
  game.turnEndsAt = new Date();
  game.turnEndsAt.setMinutes(game.turnEndsAt.getMinutes() + 5);

  if (game.state === "PickInProgress") {
    game.state = "WaitingForOtherPlayer";
  } else if (game.state === "WaitingForOtherPlayer") {
    game.state = "InProgress";
  }

  state.storage.put("entry", game);

  onGameStateChange(game, connections);

  return playerView(game, userId);
};

const handleJoin = async (
  state: DurableObjectState,
  env: Env,
  connections: IterableIterator<Connection>,
  userId: string,
  userName: string,
  emailHash: string,
) => {
  const game = await state.storage.get<GameEntry>("entry");

  // TODO:
  // * find the game with this id
  // * add userId to the set of players who can access it
  // * add this as a GameListEntry to userId
  // * update the state (potentially) of the GameListEntry associated with the current player id
  if (!game || game.state !== "WaitingForOpponent") {
    throw new Error("Game not found or not waiting for opponent");
  }

  let cards: CardEntry[] = [];
  // if the game is not random, then move to the next state
  if (!game.rules.includes("random")) {
    game.state = "PickInProgress";
  } else {
    // Get the users cards
    const cardCollectionId = env.CARD_COLLECTION.idFromName("global");
    const cardCollection = env.CARD_COLLECTION.get(cardCollectionId);
    const cardResponse = await cardCollection
      .fetch(listOwnedCardsAction(userId), {
        method: "POST",
      })
      .then((r) => r.json() as Promise<OwnedCardResponse>)
      .then((c: OwnedCardResponse) => c.entries.map((e) => e.card));
    // pick 5 random cards
    cards = cardResponse.sort(() => Math.random() - 0.5).slice(0, 5);
    game.state = "InProgress";
  }

  game.players.push({
    id: userId,
    name: userName,
    emailHash: emailHash,
    score: 5,
    cards,
    playedIndexes: [],
  });

  game.turn = (game.turn + 1) % game.players.length;
  game.turnEndsAt = new Date();
  game.turnEndsAt.setMinutes(game.turnEndsAt.getMinutes() + 5);
  state.storage.put("entry", game);

  onGameStateChange(game, connections);

  // remove this game from the waiting list
  const id = env.GAME.idFromName("global");
  const obj = env.GAME.get(id);
  obj.fetch(listJoinGameAction(game.id, game.players[0].id, userId), {
    method: "POST",
  });

  return playerView(game, userId);
};

const handleTradeCards = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  _state: DurableObjectState,
  _env: Env,
  _connections: IterableIterator<Connection>,
  _request: TradeCardsRequest,
  _userId: string,
  /* eslint-enable @typescript-eslint/no-unused-vars */
) => {
  throw new Error("Function not implemented.");
};

const handleCreate = async (
  state: DurableObjectState,
  env: Env,
  _connections: IterableIterator<Connection>,
  request: CreateRequest,
  userId: string,
  userName: string,
  emailHash: string,
) => {
  const isValid = true;
  // TODO: validate request.rules and request.tradeRule

  if (!isValid) {
    throw new Error("Cannot create game");
  }

  // save to storage
  const gameId = crypto.randomUUID();

  const endsAt = new Date();
  // set time to be 5 minutes in the future
  endsAt.setMinutes(endsAt.getMinutes() + 5);

  let cards: CardEntry[] = [];
  if (request.rules.includes("random")) {
    // find all of this userId cards by requesting from the CARD_COLLECTION durable object
    const cardCollectionId = env.CARD_COLLECTION.idFromName("global");
    const cardCollection = env.CARD_COLLECTION.get(cardCollectionId);
    const cardResponse = await cardCollection
      .fetch(listOwnedCardsAction(userId), {
        method: "POST",
      })
      .then((r) => {
        return r.json() as Promise<OwnedCardResponse>;
      })
      .then((c: OwnedCardResponse) => {
        return c.entries.map((e) => e.card);
      });
    // pick 5 random cards
    cards = cardResponse.sort(() => Math.random() - 0.5).slice(0, 5);
  }

  const game: GameEntry = {
    id: gameId,
    players: [
      {
        id: userId,
        name: userName,
        emailHash: emailHash,
        score: 5,
        cards,
        playedIndexes: [],
      },
    ],
    rules: request.rules,
    tradeRule: request.tradeRule,
    state: "WaitingForOpponent",
    turn: 0,
    turnEndsAt: endsAt,
    board: Array(9).fill({
      card: undefined,
      element: undefined,
      playerId: undefined,
    }),
  };

  if (request.opponent == OpponentType.Public) {
    const joinableGame = {
      id: gameId,
      creator: emailHash,
      createdAt: new Date().toISOString(),
      rules: request.rules,
      tradeRule: request.tradeRule,
    } as JoinableGame;

    state.storage.put<JoinableGame>(`open:${gameId}`, joinableGame);
    state.storage.put<JoinableGame>(`u:${userId}:open:${gameId}`, joinableGame);
  }

  const id = env.GAME.idFromName(gameId);
  const obj = env.GAME.get(id);
  obj.fetch(updateGameDetailsAction(gameId), {
    method: "POST",
    body: JSON.stringify(game),
  });

  return game;
};
