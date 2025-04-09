import { classNames } from ".";
import { cardImageFromKind, numberImage } from "../assets/images/cards";
import { CardEdition, CardElement } from "../shared";

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
        "relative h-full w-full overflow-hidden rounded-md border border-gray-800 bg-gradient-to-b text-center shadow-md select-none",
        { "from-blue-100 to-blue-900": colour === "blue" },
        { "from-red-100 to-red-900": colour === "red" },
        { "from-gray-100 to-gray-900": !colour },
        className ? className : "",
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

      <div className="card-numbers backface-hidden">
        <img
          className="absolute z-10 mt-[5%] ml-[18%] h-[20%] w-[20%]"
          src={numberImage(up)}
          alt={up.toString()}
        />
        <img
          className="absolute z-10 mt-[26%] ml-[5%] h-[20%] w-[20%]"
          src={numberImage(left)}
          alt={left.toString()}
        />
        <img
          className="absolute z-10 mt-[26%] ml-[27%] h-[20%] w-[20%]"
          src={numberImage(right)}
          alt={right.toString()}
        />
        <img
          className="absolute z-10 mt-[47%] ml-[18%] h-[20%] w-[20%]"
          src={numberImage(down)}
          alt={down.toString()}
        />
      </div>

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
