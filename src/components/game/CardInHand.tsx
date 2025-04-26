import { classNames } from "..";
import cardBack from "../../assets/images/back.svg";
import { ViewableCardResponse } from "../../shared";
import CardDetail from "../CardDetail";

const CardInHand: React.FC<{
  visible: boolean;
  card: ViewableCardResponse | undefined;
  index: number;
  selectedIndex?: number;
  onSelected?: (index: number) => void;
}> = ({ visible, index, card, selectedIndex, onSelected }) => {
  const key = `${visible ? "mine" : "yours"}-${index}`;
  const anySelected = selectedIndex !== undefined && visible;
  const thisSelected = selectedIndex === index;

  if (!card) {
    return (
      <img
        key={key}
        alt="unknown card"
        className="m-1 h-full w-full overflow-hidden rounded-md border border-gray-800 shadow-lg shadow-md select-none"
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
        "z-10 m-1 cursor-pointer shadow-lg transition-transform duration-200 ease-in-out",
        { "hover:z-20 hover:scale-105": visible },
        { "opacity-80": anySelected && !thisSelected },
        { "z-30 scale-105": anySelected && thisSelected },
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
