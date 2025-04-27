import { useEffect, useState } from "react";
import { useAuth } from "../providers/hooks";
import { AuthStatus } from "../services/AuthService";
import { CardEdition, CardKinds, OwnedCardResponse } from "../shared";
import { CardDetailProps } from "./CardDetail";
import LibraryList from "./LibraryList";
import { useMessageBanner } from "./MessageBanner";
import { CardRarity } from "../shared/cards";

export type LibraryCardMapping = Map<
  CardEdition,
  Map<CardLevel, LibraryCardProps[]>
>;

export interface LibraryCardProps extends CardDetailProps {
  rarity: CardRarity;
  owned: boolean;
  quantity: number;
  acquiredAt?: Date;
}

export type CardLevel = number;

const Library = () => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();

  const [cards, setCards] = useState<LibraryCardMapping>(new Map());
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await fetchData<OwnedCardResponse>(
          "GET",
          "/cards",
          null,
          AuthStatus.REQUIRED,
        );

        // go through every level and every card in that level
        // compare the card against the set of cards we got from the server
        // mark whether the card is owned or not

        const mapping: LibraryCardMapping = new Map();
        CardKinds.forEach((card) => {
          const ownedCount =
            data.entries.filter(
              (c) => c.card.kind === card.id && c.card.edition === card.edition,
            ).length || 0;
          const earliestAcquired =
            ownedCount > 0
              ? data.entries
                  .filter((c) => c.card.kind === card.id)
                  .sort(
                    (a, b) =>
                      new Date(a.acquired_at).getTime() -
                      new Date(b.acquired_at).getTime(),
                  )[0]
              : undefined;
          const libraryCard: LibraryCardProps = {
            owned: ownedCount > 0,
            kind: card.id,
            edition: card.edition,
            name: card.name,
            up: card.up,
            down: card.down,
            left: card.left,
            right: card.right,
            quantity: ownedCount,
            acquiredAt: earliestAcquired?.acquired_at,
            rarity: card.rarity,
            ...(ownedCount > 0 && { colour: "blue" }),
          };

          mapping.set(card.edition, mapping.get(card.edition) || new Map());
          mapping
            .get(card.edition)
            ?.set(card.level, mapping.get(card.edition)?.get(card.level) || []);
          mapping.get(card.edition)?.get(card.level)?.push(libraryCard);
          mapping
            .get(card.edition)
            ?.set(0, mapping.get(card.edition)?.get(0) || []);
          mapping.get(card.edition)?.get(0)?.push(libraryCard); // level = 0 all cards
        });

        setCards(mapping);
      } catch (e: unknown) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage("Unknown error occurred");
        }
      }
    };
    fetchCards();
  }, [fetchData, showMessage]);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Library
        </h1>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
          <LibraryList data={cards} />
        </div>
      </div>
    </div>
  );
};

export default Library;
