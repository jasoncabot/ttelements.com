import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../providers/hooks";
import { AuthStatus } from "../../services/AuthService";
import {
  ChooseCardsRequest,
  GameCommand,
  GameEvent,
  GameResponse,
  JoinRequest,
  PlayCardRequest,
} from "../../shared";
import Loading from "../Loading";
import { useMessageBanner } from "../MessageBanner";
import GameDetails from "./GameDetails";
import JoinConfirmation from "./JoinConfirmation";
import PickInProgressView from "./PickInProgressView";
import TradingView from "./TradingView";
import WaitingForOpponentView from "./WaitingForOpponentView";
import WinningView from "./WinningView";
import { GameUpdateByCardResponse } from "../../shared/games";

const ViewGame = () => {
  const [game, setGame] = useState<GameResponse | null>(null);
  const [gameUpdate, setGameUpdate] = useState<GameUpdateByCardResponse | null>(
    null,
  );
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
          AuthStatus.REQUIRED,
        );
        setGame(response);
      } catch (e) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage("Unable to load game");
        }
      }
    };
    if (gameId) {
      fetchGame();
    }
  }, [gameId, fetchData, showMessage]);

  const [socketToken, setSocketToken] = useState<string | null>(null);
  useEffect(() => {
    const createSocketToken = async () => {
      try {
        // create a token by POST /games/:id/ws
        const result = await fetchData<{ token: string }>(
          "POST",
          `/games/${gameId}/ws`,
          null,
          AuthStatus.REQUIRED,
        );
        setSocketToken(result.token);
      } catch (e) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage("Unable to create socket token");
        }
      }
    };
    if (gameId) {
      createSocketToken();
    }
  }, [gameId, fetchData, showMessage]);

  const handleEventReceived = useCallback(
    (event: GameEvent) => {
      switch (event.type) {
        case "state-changed": {
          setGame(event.data);
          return;
        }
        case "card-played": {
          setGameUpdate(event.data);
          return;
        }
        case "error": {
          const message = event.data as string;
          console.error(message);
          showMessage(message);
          return;
        }
      }
    },
    [showMessage],
  ); // setGame and setGameUpdate are stable and don't need to be dependencies

  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    // Ensure we have the necessary info to connect
    if (!socketToken || !gameId) {
      return;
    }

    let wsInstance: WebSocket | null = null;

    const connectToSocket = () => {
      console.log("Attempting to connect WebSocket...");
      wsInstance = new WebSocket(
        `${import.meta.env.VITE_WS_ENDPOINT}/games/${gameId}/ws?token=${socketToken}`,
        [],
      );

      wsInstance.onopen = () => {
        console.log("WebSocket connection established.");
        setSocket(wsInstance); // Update state with the live socket
      };

      wsInstance.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as GameEvent;
          handleEventReceived(event);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      wsInstance.onclose = (event) => {
        console.log("WebSocket connection closed.", event.code, event.reason);
        // Only clear the socket state if it's the current instance that closed
        setSocket((currentSocket) =>
          currentSocket === wsInstance ? null : currentSocket,
        );
        wsInstance = null;
        // Optionally reset token if closure was unexpected, needs careful handling
        // if (!event.wasClean) { setSocketToken(null); }
      };

      wsInstance.onerror = (error) => {
        console.error("WebSocket error:", error);
        wsInstance?.close(); // Attempt to close on error
        setSocket((currentSocket) =>
          currentSocket === wsInstance ? null : currentSocket,
        );
        wsInstance = null;
      };
    };

    connectToSocket();

    // Cleanup function: Called on unmount or when dependencies change.
    return () => {
      console.log("Cleanup: Closing WebSocket connection...");
      if (wsInstance && wsInstance.readyState < WebSocket.CLOSING) {
        wsInstance.close(); // Close the specific WebSocket instance created in this effect run
      }
      wsInstance = null; // Clear the local reference
    };
    // Dependencies: Effect re-runs if any of these change.
  }, [socketToken, gameId, handleEventReceived]); // Added gameId and handleEventReceived

  const sendCommand = (command: GameCommand) => {
    // Use the socket from state, ensuring it's open before sending
    if (socket && socket.readyState === WebSocket.OPEN) {
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
        AuthStatus.REQUIRED,
      );
      setGame(response);
    } catch (e) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Unable to choose cards");
      }
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
        AuthStatus.REQUIRED,
      );
      setGame(response);
    } catch (e) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Unable to trade cards");
      }
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
        AuthStatus.REQUIRED,
      );
      setGame(response);
    } catch (e) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Unable to play card");
      }
    }
  };

  const handleJoinGame = async (id: string) => {
    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${id}/player`,
        {} as JoinRequest,
        AuthStatus.REQUIRED,
      );
      if (response.id) {
        setGame(response);
      } else {
        showMessage("Unable to join game");
      }
    } catch (e) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Unable to join game");
      }
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
        return <JoinConfirmation game={game} onJoinGame={handleJoinGame} />;
      }
    case "PickInProgress":
      return <PickInProgressView onCardsChosen={handleChooseCards} />;
    case "WaitingForOtherPlayer": {
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
    }
    case "InProgress":
      return (
        <GameDetails
          game={game}
          updates={gameUpdate}
          onPlayCard={handlePlayCard}
        />
      );
    case "Trading":
      return <TradingView gameId={game.id} onCardsChosen={handleTradeCards} />;
    case "Completed":
      return (
        <div>
          <GameDetails game={game} updates={null} onPlayCard={() => {}} />
          <div className="overflow-none absolute top-0 left-0 z-10 h-full w-full bg-white/30 backdrop-blur-sm"></div>
          <div className="align-center absolute top-0 left-0 z-20 flex h-full w-full items-center justify-center">
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
