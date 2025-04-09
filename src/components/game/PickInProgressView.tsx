import {
  ChooseCardsRequest,
  OwnedCardResponse,
  ViewableCardResponse,
} from "../../shared";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../providers/hooks";
import { AuthStatus } from "../../services/AuthService";
import { useMessageBanner } from "../MessageBanner";
import CardSelectionView from "./CardSelectionView";

const PickInProgressView: React.FC<{
  onCardsChosen: (selection: ChooseCardsRequest) => void;
}> = ({ onCardsChosen }) => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();
  const [cards, setCards] = useState<ViewableCardResponse[]>([]);

  // fetch the current users cards from /cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetchData<OwnedCardResponse>(
          "GET",
          "/cards",
          null,
          AuthStatus.REQUIRED
        );
        setCards(response.entries.map((c: { card: ViewableCardResponse; }) => c.card));
      } catch (e: unknown) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage(e as string);
        }
      }
    };
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedCards = cards.sort((a, b) => b.kind - a.kind);
  return <CardSelectionView cards={sortedCards} onCardsChosen={onCardsChosen} />;
};

export default PickInProgressView;
