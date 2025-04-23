import { ArrowsRightLeftIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { JSX, SyntheticEvent } from "react";
import { Link } from "react-router";
import { GameRule, GameTradeRule } from "../shared";

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
  creator,
  rules,
  tradeRule,
  createdAt,
  onGameJoined,
}) => {
  const ruleMeta: Record<
    GameRule,
    { label: string; color: string; icon: JSX.Element }
  > = {
    open: {
      label: "Open",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    combo: {
      label: "Combo",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    elemental: {
      label: "Elemental",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    plus: {
      label: "Plus",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    pluswall: {
      label: "Plus Wall",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    random: {
      label: "Random",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    samewall: {
      label: "Same Wall",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
    same: {
      label: "Same",
      color: "bg-sky-700 text-white",
      icon: <DocumentIcon className="mr-1 h-4 w-4" />,
    },
  };

  const tradeMeta: Record<
    GameTradeRule,
    { label: string; color: string; icon: JSX.Element }
  > = {
    none: {
      label: "None",
      color: "bg-emerald-700 text-white",
      icon: <ArrowsRightLeftIcon className="mr-1 h-4 w-4" />,
    },
    one: {
      label: "One",
      color: "bg-emerald-700 text-white",
      icon: <ArrowsRightLeftIcon className="mr-1 h-4 w-4" />,
    },
    direct: {
      label: "Direct",
      color: "bg-emerald-700 text-white",
      icon: <ArrowsRightLeftIcon className="mr-1 h-4 w-4" />,
    },
    all: {
      label: "All",
      color: "bg-emerald-700 text-white",
      icon: <ArrowsRightLeftIcon className="mr-1 h-4 w-4" />,
    },
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
    <div className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-5 shadow transition duration-200 ease-in-out hover:border-amber-300/40 hover:bg-white/95 hover:shadow-lg">
      {/* Top: Rules and Trade Rule */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {rules.map((rule) => (
          <span
            key={rule}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-center text-xs font-semibold shadow-sm ${ruleMeta[rule].color} transition`}
            title={ruleMeta[rule].label}
          >
            {ruleMeta[rule].icon}
            <span>{ruleMeta[rule].label}</span>
          </span>
        ))}
        <span
          key={tradeRule}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-center text-xs font-semibold shadow-sm ${tradeMeta[tradeRule].color} transition`}
          title={tradeMeta[tradeRule].label}
        >
          {tradeMeta[tradeRule].icon}
          <span>{tradeMeta[tradeRule].label}</span>
        </span>
      </div>
      {/* Bottom: Creator, Time, Join Button */}
      <div className="mt-2 flex flex-1 items-end justify-between gap-3 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3">
          <img
            className="h-9 w-9 rounded-full border border-amber-300 object-cover shadow-sm"
            src={`https://www.gravatar.com/avatar/${creator}?d=retro`}
            alt="creator avatar"
          />
          <div className="flex flex-col justify-center">
            {createdAt && (
              <p className="text-xs leading-tight text-gray-500 opacity-80">
                Created {friendlyTimeAgo(createdAt)}
              </p>
            )}
            <p className="font-mono text-xs leading-tight text-gray-700 opacity-70">
              <Link
                to={`/games/${id}`}
                className="font-semibold text-amber-700 hover:underline focus:underline"
              >
                View Game
              </Link>
            </p>
          </div>
        </div>
        <button
          onClick={handleGameJoined}
          className="ml-auto cursor-pointer rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default JoinableGameCard;
