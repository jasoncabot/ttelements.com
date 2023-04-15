import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { classNames } from "..";
import { scoreImage } from "../../images/cards";
import { Transition } from "@headlessui/react";

const ScoreBoard: React.FC<{
  isMyTurn: boolean;
  endsAt: Date;
  me: { name: string; score: number };
  you: { name: string; score: number };
}> = ({ isMyTurn, endsAt, me, you }) => {
  const [remainingTime, setRemainingTime] = useState("00:00");
  useEffect(() => {
    const end = new Date(endsAt);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((end.getTime() - now.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setRemainingTime(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 250);
    return () => clearInterval(interval);
  }, [remainingTime, endsAt]);

  return (
    <div className="align-center flex flex-row items-center justify-center space-x-4 p-4">
      <div
        className={classNames(
          { "font-bold": isMyTurn },
          "flex flex-grow flex-row items-center text-xs"
        )}
      >
        <ChevronRightIcon
          className={classNames(
            { "opacity-0": !isMyTurn },
            "h-6 w-6 transition-opacity duration-500 ease-in-out"
          )}
        />
        {me.name}
      </div>
      <img
        src={scoreImage(me.score)}
        alt={me.score.toString()}
        className="h-6 w-6 flex-shrink md:h-12 md:w-12"
      />
      <div className="font-mono text-xl">{remainingTime}</div>
      <img
        src={scoreImage(you.score)}
        alt={me.score.toString()}
        className="h-6 w-6 flex-shrink md:h-12 md:w-12"
      />
      <div
        className={classNames(
          { "font-bold": !isMyTurn },
          "flex flex-grow flex-row items-center justify-end text-right text-xs"
        )}
      >
        {you.name}
        <ChevronLeftIcon
          className={classNames(
            { "opacity-0": isMyTurn },
            "h-6 w-6 transition-opacity duration-500 ease-in-out"
          )}
        />
      </div>
    </div>
  );
};

export default ScoreBoard;
