import { useEffect, useState } from "react";
import { classNames } from "..";

const ScoreBoard: React.FC<{
  isMyTurn: boolean;
  endsAt: Date;
  me: { name: string; score: number; emailHash: string };
  you: { name: string; score: number; emailHash: string };
}> = ({ isMyTurn, endsAt, me, you }) => {
  const [remainingTime, setRemainingTime] = useState("00:00");
  useEffect(() => {
    const end = new Date(endsAt);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((end.getTime() - now.getTime()) / 1000);
      const minutes = Math.max(0, Math.floor(diff / 60));
      const seconds = Math.max(0, diff % 60);
      setRemainingTime(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 250);
    return () => clearInterval(interval);
  }, [remainingTime, endsAt]);

  return (
    <div className="align-center flex flex-row items-center justify-center space-x-4">
      <div className="flex flex-row items-center text-gray-900">
        <img
          className={classNames(
            "ml-1 mt-1 h-6 w-6 rounded-full md:my-2 md:h-12 md:w-12",
            {
              "opacity-60": !isMyTurn,
              "border-grey-500 border": isMyTurn,
            }
          )}
          src={`https://www.gravatar.com/avatar/${me.emailHash}?d=retro`}
          title={me.name}
          alt={me.name}
        />
      </div>
      <div className="flex-grow text-right font-mono text-2xl font-bold">
        {me.score?.toString() || "5"}
      </div>
      <div className="text-s font-mono font-light tracking-tight">
        {remainingTime}
      </div>
      <div className="flex-grow font-mono text-2xl font-bold">
        {you.score?.toString() || "5"}
      </div>
      <div className="flex flex-row items-center text-gray-900">
        <img
          className={classNames(
            "mr-1 mt-1 h-6 w-6 rounded-full md:my-2 md:mr-0 md:h-12 md:w-12",
            {
              "opacity-60": isMyTurn,
              "border-grey-500 border": !isMyTurn,
            }
          )}
          src={`https://www.gravatar.com/avatar/${you.emailHash}?d=retro`}
          title={you.name}
          alt={you.name}
        />
      </div>
    </div>
  );
};

export default ScoreBoard;
