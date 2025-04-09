import {
  ArrowPathIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { SyntheticEvent, useEffect, useState } from "react";
import { classNames } from ".";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router";
import { useAuth } from "../providers/hooks";
import { AuthStatus } from "../services/AuthService";
import { OwnedCardResponse } from "../shared";
import { CardDetailProps } from "./CardDetail";
import CardRevealer from "./CardRevealer";
import { useMessageBanner } from "./MessageBanner";
import Modal from "./Modal";

const GetStarted = () => {
  const [resetting, setResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { showMessage } = useMessageBanner();

  const { fetchData } = useAuth();

  const handleResetAllCards = async () => {
    setIsConfirmModalOpen(false);
    setResetting(true);

    try {
      const data = await fetchData<OwnedCardResponse>(
        "POST",
        "/starter_pack",
        null,
        AuthStatus.REQUIRED,
      );
      setCards(data.entries.map((c) => c.card));
      setResetting(false);
      setResetComplete(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else if (typeof e === "string") {
        showMessage(e);
      } else {
        showMessage("An unknown error occurred");
      }
      setResetting(false);
      setResetComplete(false);
    }
  };

  const handleReset = (e: SyntheticEvent, value: boolean) => {
    e.preventDefault();
    setResetComplete(value);
  };

  const [cards, setCards] = useState<CardDetailProps[]>([]);

  const [existingCards, setExistingCards] = useState<CardDetailProps[]>([]);
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await fetchData<OwnedCardResponse>(
          "GET",
          "/cards",
          null,
          AuthStatus.REQUIRED,
        );
        setExistingCards(data.entries.map((c) => c.card));
      } catch (e: unknown) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else if (typeof e === "string") {
          showMessage(e);
        }
      }
    };
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <div className="mb-8 flex w-full flex-row">
        <div className="flex flex-grow flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Get Started</h1>
          <h3 className="leading-8 tracking-tight">
            Get a completely new set of cards
          </h3>
        </div>
        <div>
          <button
            type="button"
            className={classNames(
              "flex flex-shrink cursor-pointer flex-row items-center rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none",
              { "bg-gray-400": resetting },
              { "bg-amber-500 hover:bg-amber-600": !resetting },
            )}
            disabled={resetting}
            onClick={() => setIsConfirmModalOpen(true)}
          >
            Reset
            {resetting ? (
              <ArrowPathIcon className="ml-2 h-5 w-5 animate-spin text-white" />
            ) : (
              <ArrowPathIcon className="ml-2 h-5 w-5 text-white group-hover:hidden" />
            )}
            {resetComplete && (
              <CheckCircleIcon className="absolute -top-1 -right-1 h-5 w-5 animate-pulse text-white" />
            )}
          </button>
        </div>
      </div>

      <div>
        <Modal
          title="Reset Cards"
          message="Are you sure you want to reset all your cards?"
          description={`This will replace your ${existingCards.length} existing cards with a starter pack.`}
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          onConfirm={handleResetAllCards}
        />

        {!(resetComplete || resetting) && (
          <div className="rounded bg-gray-900 p-8 shadow-lg">
            <p className="text-left">
              You currently have{" "}
              {existingCards.length === 0 ? "no" : existingCards.length} cards.
            </p>
            <p>
              You can choose to discard these {existingCards.length} cards for a
              completely new set by selecting the button above.
            </p>
          </div>
        )}

        {resetComplete && (
          <>
            <div
              className="mb-8 rounded-b border-t-4 border-teal-500 bg-teal-100 px-4 py-3 text-teal-900 shadow-md"
              onClick={(e) => handleReset(e, false)}
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <InformationCircleIcon className="mr-4 h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <p className="font-bold">Success!</p>
                  <p className="text-sm">
                    Your cards have been reset. You can now start collecting.
                  </p>
                  <p className="text-sm">
                    Select each card to reveal what you got
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded bg-gray-900 p-8 shadow-lg">
              <CardRevealer cards={cards} />
              <div className="mt-4 flex flex-row justify-end">
                <div className="flex items-center rounded border border-gray-200 bg-transparent px-4 py-2 font-semibold text-gray-200 hover:border-transparent hover:bg-amber-600">
                  <Link to={`/library`}>View in library</Link>
                  <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-200" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GetStarted;
