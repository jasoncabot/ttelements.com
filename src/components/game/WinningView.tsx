import React from "react";
import { Link } from "react-router";
import { GameResponse } from "../../shared";

const WinningView: React.FC<{ game: GameResponse }> = ({ game }) => {
  let winner: string | undefined;
  if (game.you.score > game.opponent.score) {
    winner = "You win! 🎉";
  } else if (game.you.score === game.opponent.score) {
    winner = "It's a draw! 🤝";
  } else {
    winner = "You lost! 😢";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="my-4 text-2xl font-bold text-white">
        <h1>Game Over</h1>
        <p>{winner}</p>
      </div>
      <Link
        to="/play"
        className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
      >
        Play again
      </Link>
    </div>
  );
};

export default WinningView;
