import React, { useState } from "react";
import { useMessageBanner } from "../MessageBanner";
import CardDetail from "../CardDetail";
import { ChooseCardsRequest, ViewableCardResponse } from "../../shared";

const CardSelectionView: React.FC<{
  cards: ViewableCardResponse[];
  onCardsChosen: (selection: ChooseCardsRequest) => void;
}> = ({ cards, onCardsChosen }) => {
  const [selection, setSelection] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showMessage } = useMessageBanner();

  const handleCardClick = (cardIndex: number) => {
    if (selection.includes(cardIndex)) {
      setSelection(selection.filter((i) => i !== cardIndex));
    } else {
      setSelection([...selection, cardIndex]);
    }
  };

  const handleSubmit = async () => {
    if (selection.length !== 5) {
      showMessage("You must select 5 cards");
      return;
    }

    setIsSubmitting(true);
    const chooseCardsReq: ChooseCardsRequest = {
      cards: selection.map((i) => {
        return {
          kind: cards[i].kind,
          edition: cards[i].edition,
        };
      }),
    };
    await onCardsChosen(chooseCardsReq);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Choose Cards</h1>
      <div className="mt-8 rounded bg-gray-900 p-8">
        <h2 className="text-xl font-light tracking-tight">
          Selected{" "}
          {selection.length === 1 ? "1 card" : `${selection.length} cards`}
        </h2>
        <div className="flex flex-wrap mt-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`w-1/4 rounded-lg p-2 md:w-1/6 ${
                selection.includes(i) ? "bg-gray-200" : ""
              }`}
              onClick={() => handleCardClick(i)}
            >
              <CardDetail
                kind={card.kind}
                edition={card.edition}
                colour={selection.includes(i) ? "blue" : undefined}
                name={card.name}
                up={card.up}
                left={card.left}
                right={card.right}
                down={card.down}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            className="w-full rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardSelectionView;
