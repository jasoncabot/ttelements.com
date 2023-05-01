import cardBack from "./../images/back.png";
import CardDetail, { CardDetailProps } from "./CardDetail";
import { CardFlipper } from "./CardFlipper";

type CardRevealerProps = {
  cards: CardDetailProps[];
};

const CardRevealer: React.FC<CardRevealerProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {cards.map((card, index) => (
        <div key={index} className="aspect-square">
          <CardFlipper
            front={
              <img
                alt={`Reveal card ${index + 1}`}
                className="m-1 h-full w-full select-none overflow-hidden rounded-md border border-gray-800 shadow-md"
                src={cardBack}
              />
            }
            back={
              <CardDetail
                name={card.name}
                up={card.up}
                down={card.down}
                left={card.left}
                right={card.right}
                edition={card.edition}
                kind={card.kind}
                colour={card.colour}
              />
            }
          />
        </div>
      ))}
    </div>
  );
};

export default CardRevealer;
