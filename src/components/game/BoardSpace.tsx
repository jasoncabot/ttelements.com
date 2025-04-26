import { classNames } from "..";
import { SpaceResponse } from "../../shared";
import { Change } from "../../shared/flips";
import CardDetail from "../CardDetail";

export type SpaceUpdate = {
  change: Change;
  updatedSpace: SpaceResponse;
};

const BoardSpace: React.FC<{
  space: SpaceResponse;
  update: SpaceUpdate | undefined;
  onSpaceSelected: () => void;
}> = ({ space, update, onSpaceSelected }) => {
  // if there is an animation, that takes precedence and we show the card
  if (update) {
    const card = update.updatedSpace.card;
    const newOwner = update.updatedSpace.owner;
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        onClick={onSpaceSelected}
      >
        {card && (
          <CardDetail
            kind={card.kind}
            edition={card.edition}
            colour={newOwner === "you" ? "blue" : "red"}
            name={card.name}
            up={card.up}
            left={card.left}
            right={card.right}
            down={card.down}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        `flex h-full w-full flex-col items-center justify-center`,
        {
          "cursor-pointer": !space.card,
          "cursor-not-allowed": !!space.card,
        },
      )}
      onClick={onSpaceSelected}
    >
      {space.card && (
        <CardDetail
          kind={space.card.kind}
          edition={space.card.edition}
          colour={space.owner === "you" ? "blue" : "red"}
          name={space.card.name}
          up={space.card.up}
          left={space.card.left}
          right={space.card.right}
          down={space.card.down}
        />
      )}
    </div>
  );
};

export default BoardSpace;
