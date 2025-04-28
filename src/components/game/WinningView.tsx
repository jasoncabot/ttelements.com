import React from "react";
import { Link } from "react-router";
import { GameResponse } from "../../shared";

const WinningView: React.FC<{ game: GameResponse }> = ({ game }) => {
  let outcomeText: string;
  let outcomeColor: string;

  if (game.you.score > game.opponent.score) {
    outcomeText = "You win! 🎉";
    outcomeColor = "text-green-400";
  } else if (game.you.score < game.opponent.score) {
    outcomeText = "You lost! 😢";
    outcomeColor = "text-red-400";
  } else {
    outcomeText = "It's a draw! 🤝";
    outcomeColor = "text-yellow-400";
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-slate-800 p-8 text-white shadow-xl">
      <h1 className="mb-4 text-center text-4xl font-bold">Game Over</h1>
      <p className={`mb-6 text-center text-3xl font-semibold ${outcomeColor}`}>
        {outcomeText}
      </p>

      <div className="mb-8 flex items-center justify-around text-xl">
        <div className="text-center">
          <p className="font-semibold">You</p>
          <p className="text-3xl font-bold">{game.you.score}</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">Them</p>
          <p className="text-3xl font-bold">{game.opponent.score}</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Link
          to="/play"
          className="w-full rounded bg-amber-500 px-6 py-3 text-center text-lg font-bold text-white transition duration-150 ease-in-out hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800 focus:outline-none"
        >
          Play Again
        </Link>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-300">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default WinningView;
