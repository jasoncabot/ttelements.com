import { CardEdition } from "../../shared";

const cardImageMapping: { [key in CardEdition]: string[] } = {
  ["ff8"]: Array.from({ length: 110 }, (_, index) =>
    `/assets/images/ff8/${index + 1}.png`
  ),
};

export const cardImageFromKind = (kind: number, edition: CardEdition) => {
  return cardImageMapping[edition][kind - 1];
};

const numberMapping: { [key: number]: string } = {
  1: "/assets/images/numbers/1.png",
  2: "/assets/images/numbers/2.png",
  3: "/assets/images/numbers/3.png",
  4: "/assets/images/numbers/4.png",
  5: "/assets/images/numbers/5.png",
  6: "/assets/images/numbers/6.png",
  7: "/assets/images/numbers/7.png",
  8: "/assets/images/numbers/8.png",
  9: "/assets/images/numbers/9.png",
  10: "/assets/images/numbers/10.png",
};

export const numberImage = (number: number) => {
  return numberMapping[number];
};

const scoreMapping: { [key: number]: string } = {
  1: "/assets/images/scores/1.png",
  2: "/assets/images/scores/2.png",
  3: "/assets/images/scores/3.png",
  4: "/assets/images/scores/4.png",
  5: "/assets/images/scores/5.png",
  6: "/assets/images/scores/6.png",
  7: "/assets/images/scores/7.png",
  8: "/assets/images/scores/8.png",
  9: "/assets/images/scores/9.png",
};

export const scoreImage = (score: number) => {
  return scoreMapping[score];
};
