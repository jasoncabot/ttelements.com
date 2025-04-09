import { GameRule, GameTradeRule } from "../shared";
import { SyntheticEvent } from "react";
import { Link } from "react-router";

type JoinableGameCardProps = {
  id: string;
  index: number;
  creator: string;
  rules: GameRule[];
  tradeRule: GameTradeRule;
  createdAt?: string;
  onGameJoined: (gameId: string) => void;
};

const JoinableGameCard: React.FC<JoinableGameCardProps> = ({
  id,
  index,
  creator,
  rules,
  tradeRule,
  createdAt,
  onGameJoined,
}) => {
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

  const handleGameJoined = (e: SyntheticEvent) => {
    e.preventDefault();
    onGameJoined(id);
  };

  return (
    <div
      className={`w-full rounded bg-gray-100 p-4 shadow-md ${
        index % 2 === 0 ? "bg-gray-100" : "bg-white"
      }`}
    >
      <div className="pb-4">
        <div className="flex flex-wrap items-center">
          {rules.map((rule) => (
            <span
              key={rule}
              className="mt-2 mr-2 rounded-full bg-gray-300 px-3 py-1 text-center text-sm font-semibold text-gray-700"
            >
              {ruleDescriptions[rule]}
            </span>
          ))}
          <span
            key={tradeRule}
            className="mt-2 mr-2 rounded-full bg-gray-300 px-3 py-1 text-center text-sm font-semibold text-gray-700"
          >
            Trade: {tradeDescriptions[tradeRule]}
          </span>
        </div>
      </div>
      <div className="items-left flex flex-col justify-between border-t border-gray-200 pt-4 md:flex-row md:items-center">
        <div className="flex flex-grow items-center">
          <img
            className="mr-4 h-12 w-12 rounded-full object-cover"
            src={`https://www.gravatar.com/avatar/${creator}?d=retro`}
            title=""
            alt=""
          />

          <div className="flex-grow text-sm">
            {createdAt && (
              <p className="font-medium text-gray-900">
                Created {friendlyTimeAgo(createdAt)}
              </p>
            )}
            <p className="text-gray-500">
              <Link to={`/games/${id}`}>{id}</Link>
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 pt-4 md:pt-0">
          <button
            onClick={handleGameJoined}
            className="cursor-pointer rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinableGameCard;
