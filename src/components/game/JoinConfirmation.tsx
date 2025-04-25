import React from "react";
import { GameResponse } from "../../shared";
import JoinableGameCard from "../JoinableGameCard";

interface JoinConfirmationProps {
  game: GameResponse;
  onJoinGame: (id: string) => void;
}

const JoinConfirmation: React.FC<JoinConfirmationProps> = ({
  game,
  onJoinGame,
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Join this game?
        </h1>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
          <JoinableGameCard
            id={game.id}
            index={0}
            creator={game.opponent.emailHash}
            rules={game.rules}
            tradeRule={game.tradeRule}
            onGameJoined={onJoinGame}
          />
        </div>
      </div>
    </div>
  );
};

export default JoinConfirmation;
