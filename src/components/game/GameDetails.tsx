import { GameResponse } from "../../shared";
import React, { useState } from "react";
import { classNames } from "..";
import BoardSpace from "./BoardSpace";
import CardInHand from "./CardInHand";
import ScoreBoard from "./ScoreBoard";

type Props = {
  game: GameResponse;
  onPlayCard: (index: number, cardIndex: number) => void;
};

const GameDetails: React.FC<Props> = ({ game, onPlayCard }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined
  );

  const handleSelection = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(undefined);
    } else {
      setSelectedIndex(index);
    }
  };

  const handlePlayCardAt = (index: number) => {
    if (selectedIndex == null) return;
    onPlayCard(index, selectedIndex);
    setSelectedIndex(undefined);
  };

  const canSeeOpponentsCard = false;

  return (
    <div className="mx-auto flex w-full  max-w-[800px] flex-col">
      <ScoreBoard
        isMyTurn={game.isYourTurn}
        endsAt={game.turnEndsAt}
        me={game.you}
        you={game.opponent}
      />
      <div className="flex w-full flex-col flex-col-reverse md:flex-row">
        <div className="flex flex-shrink flex-row md:w-52 md:flex-col">
          {game.you.cards.map((holding, cardIndex) => (
            <CardInHand
              key={"me-" + cardIndex}
              visible={true}
              response={holding}
              index={cardIndex}
              selectedIndex={selectedIndex}
              onSelected={handleSelection}
            />
          ))}
        </div>

        <div className="flex aspect-square w-full flex-grow flex-col justify-center md:px-4 lg:px-12">
          <div className="grid grid-cols-3 grid-rows-3 rounded border border-gray-900 shadow">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={classNames(
                  "aspect-square border-gray-900",
                  { "border-b": i < 6 },
                  { "border-r": i % 3 !== 2 },
                  { "border-tl": i === 0 },
                  { "border-tr": i === 2 },
                  { "border-bl": i === 6 },
                  { "border-br": i === 8 }
                )}
              >
                <BoardSpace
                  key={`b${i}`}
                  space={game.board[i]}
                  onSpaceSelected={() => handlePlayCardAt(i)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-shrink flex-row md:w-52 md:flex-col">
          {game.opponent.cards.map((holding, cardIndex) => (
            <CardInHand
              key={"theirs-" + cardIndex}
              visible={canSeeOpponentsCard}
              response={holding}
              index={cardIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
