import { CardEdition, CardKinds, OwnedCardResponse } from "@ttelements/shared";
import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { AuthStatus } from "../services/AuthService";
import { useMessageBanner } from "./MessageBanner";
import { CardDetailProps } from "./CardDetail";
import LibraryList from "./LibraryList";

export type LibraryCardMapping = Map<
  CardEdition,
  Map<CardLevel, LibraryCardProps[]>
>;

export interface LibraryCardProps extends CardDetailProps {
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
          AuthStatus.REQUIRED
        );

        // go through every level and every card in that level
        // compare the card against the set of cards we got from the server
        // mark whether the card is owned or not

        const mapping: LibraryCardMapping = new Map();
        CardKinds.forEach((card) => {
          const ownedCount =
            data.entries.filter(
              (c) => c.card.kind === card.id && c.card.edition === card.edition
            ).length || 0;
          const earliestAcquired =
            ownedCount > 0
              ? data.entries
                  .filter((c) => c.card.kind === card.id)
                  .sort(
                    (a, b) =>
                      new Date(a.acquired_at).getTime() -
                      new Date(b.acquired_at).getTime()
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
            ...(ownedCount > 0 && { colour: "blue" }),
          };

          mapping.set(card.edition, mapping.get(card.edition) || new Map());
          mapping
            .get(card.edition)
            ?.set(card.level, mapping.get(card.edition)?.get(card.level) || []);
          mapping.get(card.edition)?.get(card.level)?.push(libraryCard);
        });

        setCards(mapping);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    fetchCards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Card Collection</h1>
      <div className="mt-8 rounded bg-gray-900 p-8">
        <LibraryList data={cards} />
      </div>
    </div>
  );
};

export default Library;
