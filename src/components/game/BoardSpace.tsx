import React from "react";
import { classNames } from "..";
import cardBack from "../../assets/images/back.svg";
import { SpaceResponse } from "../../shared";
import { Change } from "../../shared/flips";
import CardDetail from "../CardDetail";
import "./BoardSpace.css";

export type SpaceUpdate = {
  change: Change;
  updatedSpace: SpaceResponse;
};

const BoardSpace: React.FC<{
  space: SpaceResponse;
  update: SpaceUpdate | undefined;
  onSpaceSelected: () => void;
}> = React.memo(({ space, update, onSpaceSelected }) => {
  // if there is an animation, that takes precedence and we show the card
  if (update) {
    const card = update.updatedSpace.card;
    const newOwner = update.updatedSpace.owner;
    const prevOwner = space.owner;
    return (
      <div
        className={classNames(
          "flex h-full w-full flex-col items-center justify-center",
          `card-${update.change?.type}-${update.change?.direction}`,
        )}
        onClick={onSpaceSelected}
      >
        {card && (
          <div className="card-3d-double double-flipped">
            {/* Always double-flipped when animating */}
            <div className="card-face front">
              <CardDetail
                kind={card.kind}
                edition={card.edition}
                colour={prevOwner === "you" ? "blue" : "red"}
                name={card.name}
                up={card.up}
                left={card.left}
                right={card.right}
                down={card.down}
              />
            </div>
            <div className="card-face back">
              <img
                src={cardBack}
                alt="Back"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="card-face new-front">
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
            </div>
          </div>
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
});

export default BoardSpace;
