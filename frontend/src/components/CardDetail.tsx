import { CardEdition, CardElement } from "@ttelements/shared";
import { cardImageFromKind, numberImage } from "../images/cards";
import { classNames } from ".";

export type CardColour = "red" | "blue";

export interface CardDetailProps {
  kind: number;
  edition: CardEdition;
  colour?: CardColour;
  name: string;
  up: number;
  down: number;
  left: number;
  right: number;
  element?: CardElement;
  children?: React.ReactNode;
  className?: string;
}

const CardDetail: React.FC<CardDetailProps> = ({
  name,
  kind,
  edition,
  up,
  left,
  right,
  down,
  colour,
  children,
  className,
}) => {
  const description = `${name}
        ${up}
      ${left} ${right}
        ${down}`;

  const img = cardImageFromKind(kind, edition);

  return (
    <div
      className={classNames(
        "relative h-full w-full select-none overflow-hidden rounded-md border border-gray-800 bg-gradient-to-b text-center shadow-md",
        { "from-blue-100 to-blue-900": colour === "blue" },
        { "from-red-100 to-red-900": colour === "red" },
        { "from-gray-100 to-gray-900": !colour },
        className ? className : ""
      )}
    >
      <div className="sr-only">
        <div>{up === 10 ? "A" : up}</div>
        <div>
          {left === 10 ? "A" : left}&nbsp;
          {right === 10 ? "A" : right}
        </div>
        <div>{down === 10 ? "A" : down}</div>
      </div>

      <div className="absolute z-20 h-full w-full">{children}</div>

      <img
        className="absolute z-10 ml-[18%] mt-[5%] h-[20%] w-[20%] opacity-70"
        src={numberImage(up)}
        alt={up.toString()}
      />
      <img
        className="absolute z-10 ml-[5%] mt-[26%] h-[20%] w-[20%] opacity-70"
        src={numberImage(left)}
        alt={left.toString()}
      />
      <img
        className="absolute z-10 ml-[27%] mt-[26%] h-[20%] w-[20%] opacity-70"
        src={numberImage(right)}
        alt={right.toString()}
      />
      <img
        className="absolute z-10 ml-[18%] mt-[47%] h-[20%] w-[20%] opacity-70"
        src={numberImage(down)}
        alt={down.toString()}
      />

      <img
        src={img}
        title={description}
        alt={description}
        className="z-0 h-full w-full"
      />
    </div>
  );
};

export default CardDetail;
