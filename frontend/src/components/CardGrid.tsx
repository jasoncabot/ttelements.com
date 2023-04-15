import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { classNames } from ".";
import CardDetail from "./CardDetail";
import { LibraryCardProps } from "./Library";

interface CardGridProps {
  cards: LibraryCardProps[];
}

const CardGrid: React.FC<CardGridProps> = ({ cards }) => {
  function quantity(kind: number): React.ReactNode {
    // go through cards and return how many of these there are
    return cards.filter((card) => card.owned && card.kind === kind).length;
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.kind}
          className="overflow-hidden rounded-lg bg-white shadow"
        >
          <div className="space-y-1 p-8 pb-4">
            <CardDetail
              colour={card.colour}
              edition={card.edition}
              kind={card.kind}
              up={card.up}
              down={card.down}
              left={card.left}
              right={card.right}
              name={card.name}
            />
            <div className="text-lg font-medium text-gray-900">{card.name}</div>
            <div className="flex flex-row items-center">
              <CheckBadgeIcon
                className={classNames(
                  { "text-green-500": card.owned },
                  { "text-gray-300": !card.owned },
                  "mr-1 h-6 w-6"
                )}
              />
              <span className="flex-start flex flex-row items-center truncate text-sm font-medium text-gray-500">
                {`× ${quantity(card.kind)}`}
              </span>
            </div>
            {card.acquiredAt && (
              <span className="text-gray-500">
                First acquired on{" "}
                {new Date(card.acquiredAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
