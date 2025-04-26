import React, { useEffect, useState } from "react";
import { classNames } from "..";
import { GameResponse } from "../../shared";
import { GameUpdateByCardResponse } from "../../shared/games";
import BoardSpace, { SpaceUpdate } from "./BoardSpace";
import CardInHand from "./CardInHand";
import ScoreBoard from "./ScoreBoard";

type Props = {
  game: GameResponse;
  updates: GameUpdateByCardResponse | null;
  onPlayCard: (index: number, cardIndex: number) => void;
};

const GameDetails: React.FC<Props> = ({ game, updates, onPlayCard }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined,
  );
  const [gameView, setGameView] = useState<GameResponse>(game);
  const [animationStep, setAnimationStep] = useState(-1);

  useEffect(() => {
    if (updates && updates.changes.length > 0) {
      let step = 0;
      setAnimationStep(step);
      const interval = setInterval(() => {
        step++;
        if (step < updates.changes.length) {
          setAnimationStep(step);
        } else {
          setAnimationStep(-1);
          setGameView(updates.finalState);
          setSelectedIndex(undefined);
          clearInterval(interval);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [updates, gameView]);

  // Helper to get animation details for a space at the current step
  const getAnimationForSpace: (
    spaceIndex: number,
  ) => SpaceUpdate | undefined = (spaceIndex) => {
    if (animationStep < 0 || !updates) {
      return undefined;
    }
    return {
      change: updates.changes[animationStep][spaceIndex],
      updatedSpace: updates.finalState.board[spaceIndex],
    };
  };

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
    <div className="mx-auto flex w-full max-w-[800px] flex-col">
      <ScoreBoard
        isMyTurn={gameView.isYourTurn}
        endsAt={gameView.turnEndsAt}
        me={gameView.you}
        you={gameView.opponent}
      />
      <div className="flex w-full flex-col flex-col-reverse md:flex-row">
        <div className="flex flex-shrink flex-row md:w-52 md:flex-col">
          {gameView.you.cards.map((holding, cardIndex) => (
            <CardInHand
              key={"me-" + cardIndex}
              visible={true}
              card={holding.card}
              index={cardIndex}
              selectedIndex={selectedIndex}
              onSelected={handleSelection}
            />
          ))}
        </div>

        <div className="flex aspect-square w-full flex-grow flex-col justify-center md:px-4 lg:px-12">
          <div className="grid grid-cols-3 grid-rows-3 rounded border border-gray-900 shadow">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const update = getAnimationForSpace(i);
              return (
                <div
                  key={`b${i}${update?.change ? update.change.type : ""}`}
                  className={classNames(
                    "aspect-square border-gray-900",
                    { "border-b": i < 6 },
                    { "border-r": i % 3 !== 2 },
                    { "border-tl": i === 0 },
                    { "border-tr": i === 2 },
                    { "border-bl": i === 6 },
                    { "border-br": i === 8 },
                  )}
                >
                  <BoardSpace
                    key={`b${i}${update?.change ? update.change.type : ""}`}
                    space={gameView.board[i]}
                    onSpaceSelected={() => handlePlayCardAt(i)}
                    update={update}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-shrink flex-row md:w-52 md:flex-col">
          {gameView.opponent.cards.map((holding, cardIndex) => (
            <CardInHand
              key={"theirs-" + cardIndex}
              visible={canSeeOpponentsCard}
              card={holding.card}
              index={cardIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
