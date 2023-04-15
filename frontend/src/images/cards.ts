import { CardEdition } from "@ttelements/shared";

let cardImageMapping = { ff8: [] } as { [key in CardEdition]: string[] };
for (let i = 0; i < 110; i++) {
  const image = require(`./../images/ff8/${i + 1}.png`);
  cardImageMapping.ff8.push(image);
}

let numberImages = [] as string[];
for (let i = 0; i < 11; i++) {
  const image = require(`./../images/numbers/${i}.png`);
  numberImages.push(image);
}

let scoreImages = [] as string[];
for (let i = 0; i < 9; i++) {
  const image = require(`./../images/scores/${i + 1}.png`);
  scoreImages.push(image);
}

export const cardImageFromKind = (kind: number, edition: CardEdition) => {
  return cardImageMapping[edition][kind - 1];
};

export const numberImage = (number: number) => {
  return numberImages[number];
};

export const scoreImage = (score: number) => {
  return scoreImages[score - 1];
};
