import { SpaceResponse } from "../../shared";
import CardDetail from "../CardDetail";

const BoardSpace: React.FC<{
  space: SpaceResponse;
  onSpaceSelected: () => void;
}> = ({ space, onSpaceSelected }) => {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
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
