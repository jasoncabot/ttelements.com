import { RadioGroup, Switch } from "@headlessui/react";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import {
  CreateRequest,
  GameResponse,
  GameRule,
  GameTradeRule,
  JoinRequest,
  JoinableGame,
} from "@ttelements/shared";
import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { classNames } from ".";
import { useAuth } from "../providers/AuthProvider";
import { AuthStatus } from "../services/AuthService";
import { useMessageBanner } from "./MessageBanner";
import JoinGame from "./game/JoinGame";
import GameRulePanel from "./GameRulePanel";

enum OpponentType {
  Computer = "computer",
  Public = "public",
  Private = "private",
}

const GameOptions = () => {
  const { fetchData } = useAuth();
  const navigate = useNavigate();
  const { showMessage } = useMessageBanner();

  const [tradeRuleIdx, setTradeRuleIdx] = useState(0);
  const [opponentType, setOpponentType] = useState(OpponentType.Public);

  type RuleDefinition = {
    key: GameRule;
    title: string;
    toggle: [boolean, (value: boolean) => void];
    description: {
      on: string;
      off: string;
    };
  };

  const rules: RuleDefinition[] = [
    {
      key: "open",
      title: "Open",
      toggle: useState(true),
      description: {
        on: "You can see your opponents cards",
        off: "Your opponents cards are hidden",
      },
    },
    {
      key: "random",
      title: "Random",
      toggle: useState(true),
      description: {
        on: "Cards are picked randomly",
        off: "You choose your cards",
      },
    },
    {
      key: "same",
      title: "Same",
      toggle: useState(true),
      description: {
        on: "Cards are flipped if numbers on at least two sides of the placed card match those it touches",
        off: "Same rule is not active",
      },
    },
    {
      key: "plus",
      title: "Plus",
      toggle: useState(true),
      description: {
        on: "Cards are flipped if touching numbers sum to the same value on at least two sides of placed card",
        off: "Plus rule is not active",
      },
    },
    {
      key: "samewall",
      title: "Same Wall",
      toggle: useState(true),
      description: {
        on: "Same Wall",
        off: "Same Wall rule is not active",
      },
    },
    {
      key: "pluswall",
      title: "Plus Wall",
      toggle: useState(true),
      description: {
        on: "Plus Wall",
        off: "Plus Wall rule is not active",
      },
    },
    {
      key: "combo",
      title: "Combo",
      toggle: useState(true),
      description: {
        on: "Cards flipped by same or plus may flip more cards if they have a higher number on touching side",
        off: "Flipped cards do not trigger flips of other cards",
      },
    },
    {
      key: "elemental",
      title: "Elemental",
      toggle: useState(true),
      description: {
        on: "Board contains random elements that increase or decrease card values",
        off: "There are no elements on the board",
      },
    },
  ];

  type TradeRuleDefinition = {
    key: GameTradeRule;
    title: string;
    description: string;
  };

  const tradeRules: TradeRuleDefinition[] = [
    { key: "none", title: "None", description: "No cards are traded" },
    { key: "one", title: "One", description: "Winner takes one card" },
    {
      key: "direct",
      title: "Direct",
      description: "Each player keeps the cards they flipped",
    },
    { key: "all", title: "All", description: "Winner takes all cards" },
  ];

  type OpponentDefinition = {
    key: OpponentType;
    title: string;
    description: string;
  };
  const opponents: OpponentDefinition[] = [
    {
      key: OpponentType.Computer,
      title: "Computer",
      description: "Play against the computer",
    },
    {
      key: OpponentType.Public,
      title: "Public",
      description: "Play against a random player",
    },
    {
      key: OpponentType.Private,
      title: "Private",
      description: "Play against a friend",
    },
  ];

  const handleCreateGame = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const response = await fetchData<{ id: string }>(
        "POST",
        `/games`,
        {
          rules: rules
            .filter((rule) => rule.toggle[0])
            .map((rule) => rule.key as GameRule),
          tradeRule: tradeRules[tradeRuleIdx].key,
        } as CreateRequest,
        AuthStatus.REQUIRED
      );
      if (response.id) {
        navigate(`/games/${response.id}`);
      } else {
        showMessage("Unable to create game");
      }
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  const handleJoinGame = async (e: SyntheticEvent, id: string) => {
    e.preventDefault();
    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${id}/player`,
        {} as JoinRequest,
        AuthStatus.REQUIRED
      );
      if (response.id) {
        navigate(`/games/${response.id}`);
      } else {
        showMessage("Unable to join game");
      }
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  const [games, setGames] = useState<JoinableGame[]>([]);
  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await fetchData<{ games: JoinableGame[] }>(
          "GET",
          "/waiting-games",
          null,
          AuthStatus.REQUIRED
        );
        setGames(data.games);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    loadGames();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:flex-row md:p-12">
      <div className="w-full md:w-1/2 md:pr-4">
        <h1 className="text-3xl font-bold tracking-tight">Join one of these</h1>
        <JoinGame games={games} onGameJoined={handleJoinGame} />
      </div>
      <div className="mt-12 w-full md:mt-0 md:w-1/2 md:pl-4">
        <h1 className="text-3xl font-bold tracking-tight">Create your own</h1>
        <form
          onSubmit={handleCreateGame}
          className="mt-8 rounded bg-gray-900 p-8 shadow-md"
        >
          <GameRulePanel title="Opponent">
            <RadioGroup
              value={opponentType}
              onChange={setOpponentType}
              className="mb-8"
            >
              {opponents.map((opponent, idx) => (
                <RadioGroup.Option key={idx} value={opponent.key}>
                  <div className="border-1 mb-4 flex flex-grow cursor-pointer flex-col rounded-lg border border-gray-300 border-opacity-50 p-4 ui-checked:border-amber-500 ui-checked:bg-amber-500 ui-checked:bg-opacity-20">
                    <RadioGroup.Label
                      as="span"
                      className="font-bold tracking-tight text-gray-200"
                    >
                      {opponent.title}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className="text-sm font-light tracking-tight text-gray-200"
                    >
                      {opponent.description}
                    </RadioGroup.Description>
                  </div>
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </GameRulePanel>

          <GameRulePanel title="Rules">
            <div className="mb-8">
              {rules.map((rule, index) => {
                return (
                  <Switch.Group
                    key={rule.key}
                    as="div"
                    className="mb-4 flex flex-row"
                  >
                    <div className="flex flex-shrink-0 flex-col justify-start pt-1">
                      <ChevronDoubleRightIcon className="mr-4 h-6 w-6 text-gray-200" />
                    </div>
                    <Switch.Label className="flex flex-grow cursor-pointer flex-col">
                      <span className="font-bold text-gray-200">
                        {rule.title}
                      </span>
                      <span className="text-xs font-light tracking-tight text-gray-200 transition">
                        {rule.toggle[0]
                          ? rule.description.on
                          : rule.description.off}
                      </span>
                    </Switch.Label>
                    <Switch
                      key={"rule-" + index}
                      checked={rule.toggle[0]}
                      onChange={rule.toggle[1]}
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full ring-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ui-checked:bg-amber-600 ui-not-checked:bg-white"
                    >
                      <span className="sr-only">
                        {rule.toggle[0]
                          ? rule.description.on
                          : rule.description.off}
                      </span>
                      <span
                        className={classNames(
                          " inline-block h-4 w-4 translate-x-1 transform cursor-pointer rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          { "translate-x-6 bg-white": rule.toggle[0] },
                          { "bg-gray-500": !rule.toggle[0] }
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                );
              })}
            </div>
          </GameRulePanel>

          <GameRulePanel title="Trade">
            <RadioGroup value={tradeRuleIdx} onChange={setTradeRuleIdx}>
              {tradeRules.map((rule, idx) => (
                <RadioGroup.Option key={rule.key} value={idx}>
                  <div className="border-1 mb-4 flex flex-grow cursor-pointer flex-col rounded-lg border border-gray-300 border-opacity-50 p-4 ui-checked:border-amber-500 ui-checked:bg-amber-500 ui-checked:bg-opacity-20">
                    <RadioGroup.Label
                      as="span"
                      className="font-bold tracking-tight text-gray-200"
                    >
                      {rule.title}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className="text-sm font-light tracking-tight text-gray-200"
                    >
                      {rule.description}
                    </RadioGroup.Description>
                  </div>
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </GameRulePanel>

          <ul className="mt-4 flex flex-row flex-wrap">
            {rules && rules.length > 0 ? (
              rules
                .filter((rule) => rule.toggle[0])
                .map((rule) => (
                  <li
                    key={rule.title}
                    title={rule.description.on}
                    className="ml-0 mr-4 mt-4 flex items-center justify-center rounded-full bg-slate-500 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md"
                  >
                    {rule.title}
                  </li>
                ))
            ) : (
              <li>None</li>
            )}
            <li
              className="mt-4 flex items-center justify-center rounded-full bg-slate-500 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md"
              title={tradeRules[tradeRuleIdx].description}
            >
              Trade: {tradeRules[tradeRuleIdx].title}
            </li>
          </ul>
          <button
            className="mt-8 w-full rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            type="submit"
          >
            Play
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameOptions;
