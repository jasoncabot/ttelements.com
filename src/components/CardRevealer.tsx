import cardBack from "../assets/images/back.svg";
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
              <CardDetail
                key={index}
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
            back={
              <img
                alt={`Reveal card ${index + 1}`}
                className="h-full w-full overflow-hidden rounded-md border border-gray-800 shadow-md select-none"
                src={cardBack}
              />
            }
          />
        </div>
      ))}
    </div>
  );
};

export default CardRevealer;
