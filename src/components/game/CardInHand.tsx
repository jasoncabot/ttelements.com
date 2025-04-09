import { CardResponse } from "../../shared";
import cardBack from "../../assets/images/back.svg";
import { classNames } from "..";
import CardDetail from "../CardDetail";

const CardInHand: React.FC<{
  visible: boolean;
  response: CardResponse;
  index: number;
  selectedIndex?: number;
  onSelected?: (index: number) => void;
}> = ({ visible, index, response, selectedIndex, onSelected }) => {
  const key = `${visible ? "mine" : "yours"}-${index}`;
  const card = response.card;
  const anySelected = selectedIndex !== undefined && visible;
  const thisSelected = selectedIndex === index;
  if (!card) {
    return (
      <img
        key={key}
        alt="unknown card"
        className="m-1 h-full w-full select-none overflow-hidden rounded-md border border-gray-800 shadow-md"
        src={cardBack}
      />
    );
  }

  return (
    <CardDetail
      key={key}
      kind={card.kind}
      edition={card.edition}
      colour={visible ? "blue" : "red"}
      name={card.name}
      up={card.up}
      left={card.left}
      right={card.right}
      down={card.down}
      className={classNames(
        "z-10 m-1 transition-transform duration-200 ease-in-out",
        { "hover:z-20 hover:scale-105": visible },
        { "opacity-80": anySelected && !thisSelected },
        { "z-30 scale-105": anySelected && thisSelected }
      )}
    >
      <div
        className="h-full w-full"
        onClick={() => (onSelected ? onSelected(index) : null)}
      ></div>
    </CardDetail>
  );
};

export default CardInHand;
