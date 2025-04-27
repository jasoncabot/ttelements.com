import { ArrowsRightLeftIcon, DocumentIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { classNames } from "..";
import { GameResponse } from "../../shared";
import {
  GameRule,
  GameTradeRule,
  GameUpdateByCardResponse,
} from "../../shared/games";
import BoardSpace, { SpaceUpdate } from "./BoardSpace";
import CardInHand from "./CardInHand";
import ScoreBoard, { ScoreBoardProps } from "./ScoreBoard";

type Props = {
  game: GameResponse;
  updates: GameUpdateByCardResponse | null;
  onPlayCard: (index: number, cardIndex: number) => void;
  onAnimationComplete: (finalState: GameResponse) => void;
};

const GameDetails: React.FC<Props> = ({
  game,
  updates,
  onPlayCard,
  onAnimationComplete,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined,
  );
  const [animationStep, setAnimationStep] = useState(-1);
  const [scoreInfo, setScoreInfo] = useState({
    isMyTurn: game.isYourTurn,
    endsAt: game.turnEndsAt,
    me: game.you,
    you: game.opponent,
  } as ScoreBoardProps);
  const [myHand, setMyHand] = useState(game.you.cards);
  const [opponentHand, setOpponentHand] = useState(game.opponent.cards);

  useEffect(() => {
    if (updates && updates.changes.length > 0) {
      let step = 0;
      setAnimationStep(step);
      setScoreInfo({
        // TODO; we could set this to update the score on each step
        isMyTurn: updates.finalState.isYourTurn,
        endsAt: updates.finalState.turnEndsAt,
        me: updates.finalState.you,
        you: updates.finalState.opponent,
      });
      setMyHand(updates.finalState.you.cards);
      setOpponentHand(updates.finalState.opponent.cards);

      const interval = setInterval(() => {
        step++;
        if (step < updates.changes.length) {
          setAnimationStep(step);
        } else {
          setAnimationStep(-1);
          setSelectedIndex(undefined);
          clearInterval(interval);
          onAnimationComplete(updates.finalState);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [updates, onAnimationComplete]);

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
      <ScoreBoard {...scoreInfo} />
      <div className="flex w-full flex-col flex-col-reverse md:flex-row">
        <div className="flex flex-shrink flex-row md:w-52 md:flex-col">
          {myHand.map((holding, cardIndex) => (
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
                  key={`b${i}`}
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
                    key={`b${i}`}
                    space={game.board[i]}
                    onSpaceSelected={() => handlePlayCardAt(i)}
                    update={update}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-shrink flex-row md:w-52 md:flex-col">
          {opponentHand.map((holding, cardIndex) => (
            <CardInHand
              key={"theirs-" + cardIndex}
              visible={canSeeOpponentsCard}
              card={holding.card}
              index={cardIndex}
            />
          ))}
        </div>
      </div>

      {/* Show the rules of the game */}
      <div className="mt-4 flex w-full flex-row items-center justify-center gap-2 bg-gray-900 p-2 text-sm text-gray-200 md:rounded">
        <GameRuleDisplay rules={game.rules || []} tradeRule={game.tradeRule} />
      </div>
    </div>
  );
};

type GameRuleDisplayProps = {
  rules: GameRule[];
  tradeRule: GameTradeRule;
};

const GameRuleDisplay: React.FC<GameRuleDisplayProps> = ({
  rules,
  tradeRule,
}) => {
  const titles: Record<GameRule, string> = {
    open: "Open",
    random: "Random",
    same: "Same",
    plus: "Plus",
    samewall: "Same Wall",
    pluswall: "Plus Wall",
    combo: "Combo",
    elemental: "Elemental",
  };
  const tradeRuleTitles: Record<GameTradeRule, string> = {
    none: "None",
    one: "One",
    direct: "Direct",
    all: "All",
  };

  return (
    <ul className="flex flex-row flex-wrap items-center justify-center gap-2">
      {rules.map((rule) => (
        <li
          key={rule}
          title={titles[rule] || rule}
          className="flex cursor-pointer items-center justify-center rounded-full bg-gray-700 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md"
        >
          <DocumentIcon className="h-5 w-5 text-white" />
          <span className="ml-1">{titles[rule] || rule}</span>
        </li>
      ))}
      <li
        className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md transition hover:bg-emerald-800"
        title={tradeRuleTitles[tradeRule] || tradeRule}
      >
        <ArrowsRightLeftIcon className="h-5 w-5 text-white" />
        <span>{tradeRuleTitles[tradeRule] || tradeRule}</span>
      </li>
    </ul>
  );
};

export default GameDetails;
