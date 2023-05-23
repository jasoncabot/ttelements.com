import {
  ChooseCardsRequest,
  OwnedCardResponse,
  ViewableCardResponse,
} from "@ttelements/shared";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { AuthStatus } from "../../services/AuthService";
import { useMessageBanner } from "../MessageBanner";
import CardSelectionView from "./CardSelectionView";

const TradingView: React.FC<{
  gameId: string;
  onCardsChosen: (selection: ChooseCardsRequest) => void;
}> = ({ gameId, onCardsChosen }) => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();
  const [cards, setCards] = useState<ViewableCardResponse[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetchData<OwnedCardResponse>(
          "GET",
          `/games/${gameId}/trades`,
          null,
          AuthStatus.REQUIRED
        );
        setCards(response.entries.map((c) => c.card));
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedCards = cards.sort((a, b) => b.kind - a.kind);
  return <CardSelectionView cards={sortedCards} onCardsChosen={onCardsChosen} />;
};

export default TradingView;
