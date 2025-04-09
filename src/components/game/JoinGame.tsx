import { JoinableGame } from "../../shared";
import JoinableGameCard from "../JoinableGameCard";

type JoinGameProps = {
  games: JoinableGame[];
  onGameJoined: (gameId: string) => void;
};

const JoinGame: React.FC<JoinGameProps> = ({ games, onGameJoined }) => {
  return (
    <div className="mt-8 w-full space-y-8 rounded bg-gray-900 p-8 shadow-md">
      {games.map((game, index) => (
        <JoinableGameCard
          key={game.id}
          id={game.id}
          index={index}
          creator={game.creator}
          rules={game.rules}
          tradeRule={game.tradeRule}
          createdAt={game.createdAt}
          onGameJoined={onGameJoined}
        />
      ))}
    </div>
  );
};

export default JoinGame;
