import {
  CardPlayedEvent,
  ChooseCardsRequest,
  GameCommand,
  GameEvent,
  GameResponse,
  JoinRequest,
  OwnedCardResponse,
  PlayCardRequest,
  PlayerResponse,
  ViewableCardResponse,
} from "@ttelements/shared";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { AuthStatus } from "../../services/AuthService";
import Loading from "../Loading";
import { useMessageBanner } from "../MessageBanner";
import GameDetails from "./GameDetails";

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
  }, [gameId, fetchData]);

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
  }, [gameId, fetchData]);

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
        `${process.env.REACT_APP_WS_ENDPOINT}/games/${gameId}/ws?token=${socketToken}`,
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
        return <JoinGameCard game={game} onGameJoined={handleJoinGame} />;
      }
    case "PickInProgress":
      return <PickInProgressView onCardsChosen={handleChooseCards} />;
    case "WaitingForOtherPlayer":
      return (
        <Loading message="Waiting for other player to choose their cards" />
      );
    case "InProgress":
      return <GameDetails game={game} onPlayCard={handlePlayCard} />;
    case "Trading":
      return <TradingView gameId={game.id} onCardsChosen={handleTradeCards} />;
    case "Completed":
      return <WinningView game={game} />;
  }
};

const WinningView: React.FC<{ game: GameResponse }> = ({ game }) => {
  let winner: PlayerResponse | undefined;
  if (game.you.score > game.opponent.score) {
    winner = game.you;
  } else if (game.you.score === game.opponent.score) {
    winner = undefined;
  } else {
    winner = game.opponent;
  }

  if (winner === undefined) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="mt-4 text-2xl font-bold text-white">
          <h1>Game Over</h1>
          <p>It was a draw!</p>
        </div>
        <Link to="/play" className="mt-4">
          Play again
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Game Over</h1>
      <p>{winner.name} won!</p>
    </div>
  );
};

const TradingView: React.FC<{
  gameId: string;
  onCardsChosen: (selection: ChooseCardsRequest) => void;
}> = ({ gameId, onCardsChosen }) => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();
  const [cards, setCards] = useState<ViewableCardResponse[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetchData<OwnedCardResponse>(
          "GET",
          `/games/${gameId}/trades`,
          null,
          AuthStatus.REQUIRED
        );
        setCards(response.entries.map((c) => c.card));
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    fetchCards();
  }, []);

  return <CardSelectionView cards={cards} onCardsChosen={onCardsChosen} />;
};

const PickInProgressView: React.FC<{
  onCardsChosen: (selection: ChooseCardsRequest) => void;
}> = ({ onCardsChosen }) => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();
  const [cards, setCards] = useState<ViewableCardResponse[]>([]);

  // fetch the current users cards from /cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetchData<OwnedCardResponse>(
          "GET",
          "/cards",
          null,
          AuthStatus.REQUIRED
        );
        setCards(response.entries.map((c) => c.card));
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    fetchCards();
  }, []);

  return <CardSelectionView cards={cards} onCardsChosen={onCardsChosen} />;
};

const JoinGameCard: React.FC<{
  game: GameResponse;
  onGameJoined: (id: string) => void;
}> = ({ game, onGameJoined }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{game.id}</h3>
        <p className="mt-2 text-gray-600">{game.id}</p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="text-sm">
            <p className="font-medium text-gray-900">Game ID</p>
            <p className="text-gray-500">{game.id}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <a
            href={`/games/${game.id}`}
            onClick={(e) => {
              e.preventDefault();
              onGameJoined(game.id);
            }}
            className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          >
            Join Game
          </a>
        </div>
      </div>
    </div>
  );
};

const WaitingForOpponentView: React.FC<{
  gameId: string;
}> = ({ gameId }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = document.location.toString();
    }
  });

  return (
    <div className="flex flex-col items-center">
      <div className="mt-16 rounded bg-gray-900 p-8 shadow-md md:w-1/2">
        <h1 className="text-2xl font-bold tracking-tight">
          Waiting for opponent
        </h1>
        <h2 className="text-l text-gray-400 ">
          Share this link with your opponent
        </h2>
        <div className="mt-8">
          <input
            ref={inputRef}
            type="text"
            autoFocus={true}
            className="title-font w-full rounded p-4 text-center text-sm font-medium text-gray-900"
          />
          <button
            type="button"
            className="mt-4 w-full rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            onClick={async (e) => {
              const field = inputRef.current;
              if (!field) return;

              field.select();
              field.setSelectionRange(0, 99999);

              // check if we can use the clipboard
              if (!navigator.clipboard) {
                return;
              }
              await navigator.clipboard.writeText(field.value);
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

const CardSelectionView: React.FC<{
  cards: ViewableCardResponse[];
  onCardsChosen: (selection: ChooseCardsRequest) => void;
}> = ({ cards, onCardsChosen }) => {
  const [selection, setSelection] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showMessage } = useMessageBanner();

  const handleCardClick = (cardIndex: number) => {
    if (selection.includes(cardIndex)) {
      setSelection(selection.filter((i) => i !== cardIndex));
    } else {
      setSelection([...selection, cardIndex]);
    }
  };

  const handleSubmit = async () => {
    if (selection.length !== 5) {
      showMessage("You must select 5 cards");
      return;
    }

    setIsSubmitting(true);
    const x: ChooseCardsRequest = {
      cards: selection.map((i) => {
        return {
          kind: cards[i].kind,
          edition: cards[i].edition,
        };
      }),
    };
    await onCardsChosen(x);
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="flex flex-wrap">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`w-1/4 p-2 ${
              selection.includes(i) ? "bg-blue-200" : ""
            }`}
            onClick={() => handleCardClick(i)}
          >
            OMG my card is {card.name}
          </div>
        ))}
      </div>
      <button
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        Submit
      </button>
    </div>
  );
};

export default ViewGame;
