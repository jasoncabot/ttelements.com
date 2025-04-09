import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../providers/hooks";
import { AuthStatus } from "../../services/AuthService";
import {
  CardPlayedEvent,
  ChooseCardsRequest,
  GameCommand,
  GameEvent,
  GameResponse,
  JoinRequest,
  PlayCardRequest,
} from "../../shared";
import JoinableGameCard from "../JoinableGameCard";
import Loading from "../Loading";
import { useMessageBanner } from "../MessageBanner";
import GameDetails from "./GameDetails";
import PickInProgressView from "./PickInProgressView";
import TradingView from "./TradingView";
import WaitingForOpponentView from "./WaitingForOpponentView";
import WinningView from "./WinningView";

const ViewGame = () => {
  const [game, setGame] = useState<GameResponse | null>(null);
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();

  const { gameId } = useParams();

  // load the game from the server
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetchData<GameResponse>(
          "GET",
          `/games/${gameId}`,
          null,
          AuthStatus.REQUIRED
        );
        setGame(response);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    if (gameId) {
      fetchGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const [socketToken, setSocketToken] = useState<string | null>(null);
  useEffect(() => {
    const createSocketToken = async () => {
      try {
        // create a token by POST /games/:id/ws
        const result = await fetchData<{ token: string }>(
          "POST",
          `/games/${gameId}/ws`,
          null,
          AuthStatus.REQUIRED
        );
        setSocketToken(result.token);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    if (gameId) {
      createSocketToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handleEventReceived = (event: GameEvent) => {
    switch (event.type) {
      case "state-changed":
        const gameResponse = event.data as GameResponse;
        setGame(gameResponse);
        return;
      case "card-played":
        const cardPlayedResponse = event.data as CardPlayedEvent;
        console.log("doing flips " + cardPlayedResponse.space);
        return;
      case "error":
        const message = event.data as string;
        console.error(message);
        showMessage(message);
        return;
    }
  };

  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const connectToSocket = async () => {
      // connect to the websocket
      const ws = new WebSocket(
        `${import.meta.env.VITE_WS_ENDPOINT}/games/${gameId}/ws?token=${socketToken}`,
        []
      );
      ws.onopen = () => {
        setSocket(ws);
      };
      ws.onmessage = (message) => {
        const event = JSON.parse(message.data) as GameEvent;

        handleEventReceived(event);
      };
      ws.onclose = () => {
        setSocketToken(null);
        setSocket(null);
      };
      ws.onerror = (error) => {
        console.log("websocket error", error);
      };
    };
    if (socketToken) {
      connectToSocket();
    }
    return () => {
      socket?.close();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketToken]);

  const sendCommand = (command: GameCommand) => {
    if (socket) {
      socket.send(JSON.stringify(command));
      return true;
    }
    return false;
  };

  const handleChooseCards = async (chooseCards: ChooseCardsRequest) => {
    if (!game) return;

    if (sendCommand({ type: "choose-cards", data: chooseCards })) {
      return;
    }

    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${game.id}/cards`,
        chooseCards,
        AuthStatus.REQUIRED
      );
      setGame(response);
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  const handleTradeCards = async (cards: ChooseCardsRequest) => {
    if (!game) return;

    if (sendCommand({ type: "trade-cards", data: cards })) {
      return;
    }

    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${game.id}/trades`,
        cards,
        AuthStatus.REQUIRED
      );
      setGame(response);
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  const handlePlayCard = async (space: number, cardIndex: number) => {
    if (!game) return;

    const move: PlayCardRequest = {
      space,
      cardIndex,
    };

    if (sendCommand({ type: "play-card", data: move })) {
      return;
    }

    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${game.id}/action`,
        move,
        AuthStatus.REQUIRED
      );
      setGame(response);
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  const handleJoinGame = async (id: string) => {
    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${id}/player`,
        {} as JoinRequest,
        AuthStatus.REQUIRED
      );
      if (response.id) {
        setGame(response);
      } else {
        showMessage("Unable to join game");
      }
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  if (!game) {
    return <Loading />;
  }

  switch (game.state) {
    case "WaitingForOpponent":
      if (game.you.id) {
        return <WaitingForOpponentView gameId={game.id} />;
      } else {
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Join this game?
            </h1>
            <div className="mt-8">
              <JoinableGameCard
                id={game.id}
                index={0}
                creator={game.opponent.emailHash}
                rules={game.rules}
                tradeRule={game.tradeRule}
                onGameJoined={handleJoinGame}
              />
            </div>
          </div>
        );
      }
    case "PickInProgress":
      return <PickInProgressView onCardsChosen={handleChooseCards} />;
    case "WaitingForOtherPlayer":
      // if we have chosen our cards, then show a loading screen
      // otherwise display the pick in progress view again
      const youHaveSelectedYourCards =
        game.you.cards.filter((c) => c.chosen).length === 5;
      if (youHaveSelectedYourCards) {
        return (
          <Loading message="Waiting for other player to choose their cards" />
        );
      } else {
        return <PickInProgressView onCardsChosen={handleChooseCards} />;
      }
    case "InProgress":
      return <GameDetails game={game} onPlayCard={handlePlayCard} />;
    case "Trading":
      return <TradingView gameId={game.id} onCardsChosen={handleTradeCards} />;
    case "Completed":
      return (
        <div>
          <GameDetails game={game} onPlayCard={() => {}} />
          <div className="overflow-none absolute left-0 top-0 z-10 h-full h-full w-full w-full bg-white/30 backdrop-blur-sm"></div>
          <div className="align-center absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center">
            <div className="rounded-lg bg-gray-900 shadow-lg">
              <div className="m-2 rounded bg-gray-800 px-24 pb-4">
                <WinningView game={game} />
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default ViewGame;
