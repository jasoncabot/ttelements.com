import { useEffect, useState } from "react";
import { cardImageFromKind } from "../assets/images/cards";

export interface Card {
  id: string;
  texture: string;
  position: [number, number, number];
}

export function useCardDeck() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the card deck
  useEffect(() => {
    const initialCards = Array(5).map((_texture, index) => ({
      id: `card-${index}`,
      texture: cardImageFromKind(1, "ff8"),
      position: [0, 0, index * 0.01] as [number, number, number],
    }));

    setCards(initialCards);
    setIsLoaded(true);
  }, []);

  // Function to remove a card from the deck
  const removeCard = (id: string) => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== id));
  };

  // Function to add a card to the deck (e.g., for reshuffling)
  const addCard = (texture: string) => {
    const newId = `card-${Math.random().toString(36).substr(2, 9)}`;
    setCards((prevCards) => [
      ...prevCards,
      {
        id: newId,
        texture,
        position: [0, 0, prevCards.length * 0.01],
      },
    ]);
  };

  // Function to reset the deck to initial state
  const resetDeck = () => {
    const initialCards = Array(5).map((_texture, index) => ({
      id: `card-${index}`,
      texture: cardImageFromKind(1, "ff8"),
      position: [0, 0, index * 0.01] as [number, number, number],
    }));

    setCards(initialCards);
  };

  return {
    cards,
    isLoaded,
    removeCard,
    addCard,
    resetDeck,
  };
}
