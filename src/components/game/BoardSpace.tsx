import React from "react";
import { classNames } from "..";
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
  isMyTurn: boolean;
  onSpaceSelected: () => void;
}> = React.memo(({ space, update, isMyTurn, onSpaceSelected }) => {
  // if there is an animation, that takes precedence
  if (update) {
    const card = update.updatedSpace.card;
    const newOwner = update.updatedSpace.owner;
    const prevOwner = space.owner;
    const changeType = update?.change?.type ?? "place";
    const flipDirection = update?.change?.direction ?? "none";

    // Determine animation class based on change type and direction
    const animationClass =
      changeType === "place"
        ? "card-place-none" // Use drop-in for placing
        : changeType === "flip"
          ? `card-flip-${flipDirection}` // Use directional flip
          : ""; // No animation for 'none' or other types

    return (
      <div
        className={classNames(
          "flex h-full w-full flex-col items-center justify-center",
        )}
        onClick={onSpaceSelected} // Keep clickable during animation? Maybe disable?
      >
        {card && changeType === "place" && (
          // Simple placement animation (e.g., drop-in)
          <div className={animationClass}>
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
        )}
        {card && changeType === "flip" && (
          // 3D Flip Animation Structure
          <div className={classNames("card-3d-container", animationClass)}>
            <div className="card-3d">
              {" "}
              {/* Apply animation class here if needed, or on container */}
              {/* Front face (card before flip) */}
              <div className="card-face front">
                <CardDetail
                  kind={card.kind}
                  edition={card.edition}
                  colour={prevOwner === "you" ? "blue" : "red"} // Original owner color
                  name={card.name}
                  up={card.up}
                  left={card.left}
                  right={card.right}
                  down={card.down}
                />
              </div>
              {/* Back face (card after flip) */}
              <div className="card-face back">
                <CardDetail
                  kind={card.kind}
                  edition={card.edition}
                  colour={newOwner === "you" ? "blue" : "red"} // New owner color
                  name={card.name}
                  up={card.up}
                  left={card.left}
                  right={card.right}
                  down={card.down}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ... existing code for non-animated state ...
  return (
    <div
      className={classNames(
        `flex h-full w-full flex-col items-center justify-center`,
        {
          "cursor-pointer": !space.card && isMyTurn, // Only allow click if it's your turn and space is empty
          "cursor-not-allowed": !!space.card || !isMyTurn,
        },
      )}
      onClick={!space.card && isMyTurn ? onSpaceSelected : undefined} // Only attach onClick if playable
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
