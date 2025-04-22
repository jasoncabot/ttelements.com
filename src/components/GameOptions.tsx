import {
  Description,
  Field,
  Label,
  Radio,
  RadioGroup,
  Switch,
} from "@headlessui/react";
import {
  ArrowsRightLeftIcon,
  DocumentIcon,
  FaceFrownIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { classNames } from ".";
import { useAuth } from "../providers/hooks";
import { AuthStatus } from "../services/AuthService";
import {
  CreateRequest,
  GameResponse,
  GameRule,
  GameTradeRule,
  JoinRequest,
  JoinableGame,
} from "../shared";
import JoinGame from "./game/JoinGame";
import GameRulePanel from "./GameRulePanel";
import { useMessageBanner } from "./MessageBanner";

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
      toggle: useState(false),
      description: {
        on: "Cards are flipped if numbers on at least two sides of the placed card match those it touches",
        off: "Same rule is not active",
      },
    },
    {
      key: "plus",
      title: "Plus",
      toggle: useState(false),
      description: {
        on: "Cards are flipped if touching numbers sum to the same value on at least two sides of placed card",
        off: "Plus rule is not active",
      },
    },
    {
      key: "samewall",
      title: "Same Wall",
      toggle: useState(false),
      description: {
        on: "Wall is 10 when checking for same rule",
        off: "Same Wall rule is not active",
      },
    },
    {
      key: "pluswall",
      title: "Plus Wall",
      toggle: useState(false),
      description: {
        on: "Wall is 10 when checking for plus rule",
        off: "Plus Wall rule is not active",
      },
    },
    {
      key: "combo",
      title: "Combo",
      toggle: useState(false),
      description: {
        on: "Cards flipped by same or plus may flip more cards if they have a higher number on touching side",
        off: "Flipped cards do not trigger flips of other cards",
      },
    },
    {
      key: "elemental",
      title: "Elemental",
      toggle: useState(false),
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
      title: "AI",
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
        AuthStatus.REQUIRED,
      );
      if (response.id) {
        navigate(`/games/${response.id}`);
      } else {
        showMessage("Unable to create game");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage(e as string);
      }
    }
  };

  const handleJoinGame = async (id: string) => {
    try {
      const response = await fetchData<GameResponse>(
        "POST",
        `/games/${id}/player`,
        {} as JoinRequest,
        AuthStatus.REQUIRED,
      );
      if (response.id) {
        navigate(`/games/${response.id}`);
      } else {
        showMessage("Unable to join game");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage(e as string);
      }
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
          AuthStatus.REQUIRED,
        );
        setGames(data.games || []);
      } catch (e: unknown) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage(e as string);
        }
      }
    };
    loadGames();
  }, [fetchData, showMessage]);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:flex-row md:p-12">
      <div className="w-full md:w-1/2 md:pr-4">
        <h1 className="text-3xl font-bold tracking-tight">Join one of these</h1>
        {games.length > 0 ? (
          <JoinGame games={games} onGameJoined={handleJoinGame} />
        ) : (
          <div className="mt-8 rounded border border-dashed border-gray-700 bg-gray-900 p-12 text-center shadow-md">
            <FaceFrownIcon className="mx-auto h-12 w-12 text-gray-200" />
            <h3 className="mt-2 text-sm font-semibold text-gray-300">
              No games available
            </h3>
          </div>
        )}
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
                <Field key={opponent.key} className="mb-4">
                  <Radio
                    key={idx}
                    value={opponent.key}
                    className="mb-4 flex flex-grow cursor-pointer flex-col rounded-lg border border-1 border-gray-300 p-4 data-[checked]:border-amber-500 data-[checked]:bg-amber-500/10"
                  >
                    <Label
                      as="span"
                      className="font-bold tracking-tight text-gray-200"
                    >
                      {opponent.title}
                    </Label>
                    <Description
                      as="span"
                      className="text-sm font-light tracking-tight text-gray-200"
                    >
                      {opponent.description}
                    </Description>
                  </Radio>
                </Field>
              ))}
            </RadioGroup>
          </GameRulePanel>

          <GameRulePanel title="Rules">
            <div className="mb-8">
              {rules.map((rule, index) => {
                return (
                  <Field key={rule.key} as="div" className="mb-4 flex flex-row">
                    <div className="flex flex-shrink-0 flex-col justify-start pt-1">
                      <ChevronDoubleRightIcon className="mr-4 h-6 w-6 cursor-pointer text-gray-200" />
                    </div>
                    <Label className="flex flex-grow cursor-pointer flex-col">
                      <span className="font-bold text-gray-200">
                        {rule.title}
                      </span>
                      <span className="text-xs font-light tracking-tight text-gray-200 transition">
                        {rule.toggle[0]
                          ? rule.description.on
                          : rule.description.off}
                      </span>
                    </Label>
                    <Switch
                      key={"rule-" + index}
                      checked={rule.toggle[0]}
                      onChange={rule.toggle[1]}
                      className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full bg-gray-500 ring-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[checked]:bg-amber-600"
                    >
                      <span className="sr-only">
                        {rule.toggle[0]
                          ? rule.description.on
                          : rule.description.off}
                      </span>
                      <span
                        className={classNames(
                          "inline-block h-4 w-4 translate-x-1 transform cursor-pointer rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          { "translate-x-6 bg-white": rule.toggle[0] },
                          { "bg-gray-200": !rule.toggle[0] },
                        )}
                      />
                    </Switch>
                  </Field>
                );
              })}
            </div>
          </GameRulePanel>

          <GameRulePanel title="Trade">
            <RadioGroup
              value={tradeRuleIdx}
              onChange={setTradeRuleIdx}
              className="mb-8"
            >
              {tradeRules.map((rule, idx) => (
                <Field key={rule.key} className="mb-4">
                  <Radio
                    key={rule.key}
                    value={idx}
                    className="mb-4 flex flex-grow cursor-pointer flex-col rounded-lg border border-1 border-gray-300 p-4 data-[checked]:border-amber-500 data-[checked]:bg-amber-500/10"
                  >
                    <Label
                      as="span"
                      className="font-bold tracking-tight text-gray-200"
                    >
                      {rule.title}
                    </Label>
                    <Description
                      as="span"
                      className="text-sm font-light tracking-tight text-gray-200"
                    >
                      {rule.description}
                    </Description>
                  </Radio>
                </Field>
              ))}
            </RadioGroup>
          </GameRulePanel>

          <ul className="mt-4 flex flex-row flex-wrap">
            <li
              key="opponent"
              title={opponents.find((o) => o.key === opponentType)?.description}
              className="mt-4 mr-4 ml-0 flex cursor-pointer items-center justify-center rounded-full bg-amber-600 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md"
            >
              <UserIcon className="h-5 w-5 text-white" />
              <span>
                {opponents.find((o) => o.key === opponentType)?.title}
              </span>
            </li>

            {rules && rules.length > 0 ? (
              rules
                .filter((rule) => rule.toggle[0])
                .map((rule) => (
                  <li
                    key={rule.title}
                    title={rule.description.on}
                    className="mt-4 mr-4 ml-0 flex cursor-pointer items-center justify-center rounded-full bg-sky-700 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md"
                  >
                    <DocumentIcon className="h-5 w-5 text-white" />
                    <span className="ml-1">{rule.title}</span>
                  </li>
                ))
            ) : (
              <li>None</li>
            )}
            <li
              className="mt-4 mr-4 ml-0 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2 font-sans text-sm font-semibold text-white no-underline shadow-md transition hover:bg-emerald-800"
              title={tradeRules[tradeRuleIdx].description}
            >
              <ArrowsRightLeftIcon className="h-5 w-5 text-white" />
              <span>{tradeRules[tradeRuleIdx].title}</span>
            </li>
          </ul>
          <button
            className="mt-8 w-full cursor-pointer rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
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
