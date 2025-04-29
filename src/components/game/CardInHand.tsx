import { classNames } from "..";
import cardBack from "../../assets/images/back.svg";
import { CardResponse } from "../../shared";
import CardDetail from "../CardDetail";

const CardInHand: React.FC<{
  isMyHand: boolean;
  holding: CardResponse;
  index: number;
  selectedIndex?: number;
  onSelected?: (index: number) => void;
}> = ({ isMyHand, holding, index, selectedIndex, onSelected }) => {
  const key = `${isMyHand ? "mine" : "yours"}-${index}`;
  const anySelected = selectedIndex !== undefined && isMyHand;
  const thisSelected = selectedIndex === index;

  console.log(
    `CardInHand @ ${key} = (hidden:${holding.hidden}, played:${holding.played})`,
  );

  if (holding.played) {
    return (
      <div
        key={key}
        className="m-1 aspect-square h-full w-full overflow-hidden select-none"
      />
    );
  }

  const { card } = holding;
  if (!card) {
    // this card is hidden but hasn't yet been played, such as with a non-Open game
    return (
      <img
        key={key}
        alt="unknown card"
        className="m-1 h-full w-full overflow-hidden rounded-md border border-gray-800 shadow-md select-none"
        src={cardBack}
      />
    );
  }

  return (
    <CardDetail
      key={key}
      kind={card.kind}
      edition={card.edition}
      colour={isMyHand ? "blue" : "red"}
      name={card.name}
      up={card.up}
      left={card.left}
      right={card.right}
      down={card.down}
      className={classNames(
        "z-10 m-1 shadow-lg transition-transform duration-200 ease-in-out",
        { "cursor-pointer hover:z-20 hover:scale-105": isMyHand },
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
