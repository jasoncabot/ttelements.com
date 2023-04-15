import { GameRule, GameTradeRule, JoinableGame } from "@ttelements/shared";
import { SyntheticEvent } from "react";

type JoinGameProps = {
  games: JoinableGame[];
  onGameJoined: (e: SyntheticEvent, gameId: string) => void;
};

const JoinGame: React.FC<JoinGameProps> = ({ games, onGameJoined }) => {
  const ruleDescriptions: Record<GameRule, string> = {
    open: "Open",
    combo: "Combo",
    elemental: "Elemental",
    plus: "Plus",
    pluswall: "Plus Wall",
    random: "Random",
    samewall: "Same Wall",
    same: "Same",
  };
  const tradeDescriptions: Record<GameTradeRule, string> = {
    none: "None",
    one: "One",
    direct: "Direct",
    all: "All",
  };

  const friendlyTimeAgo = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="mt-8 w-full overflow-scroll rounded bg-gray-900 p-0 shadow-md">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="px-4 py-4 text-left">Player</th>
            <th className="px-4 py-4 text-left">Created</th>
            <th className="px-4 py-4 text-left">Rules</th>
            <th className="px-4 py-4 text-left">Trade</th>
            <th className="px-4 py-4 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <tr
              key={game.id}
              className={`tracking-tight text-gray-700 ${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              <td className="px-4 py-4">{game.creator}</td>
              <td className="px-4 py-4">{friendlyTimeAgo(game.createdAt)}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center">
                  {game.rules.map((rule) => (
                    <span
                      key={rule}
                      className="mr-2 mt-2 rounded-full bg-gray-300 px-3 py-1 text-center text-sm font-semibold text-gray-700"
                    >
                      {ruleDescriptions[rule]}
                    </span>
                  ))}
                </div>
              </td>
              <td className="relative px-4 py-4">
                {tradeDescriptions[game.tradeRule]}
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={(e) => onGameJoined(e, game.id)}
                  className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600"
                >
                  Join
                </button>
              </td>
            </tr>
          ))}

          {games.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center">
                Nothing to see here, why not create your own?
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JoinGame;
