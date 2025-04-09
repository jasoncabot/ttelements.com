import { CardRarity } from "../../../shared/cards";
import common from "./common.svg";
import legendary from "./legendary.svg";
import rare from "./rare.svg";
import ultraRare from "./ultra-rare.svg";
import uncommon from "./uncommon.svg";

export const rarityIconComponent = (rarity: CardRarity) => {
  switch (rarity) {
    case "common":
      return common;
    case "rare":
      return rare;
    case "uncommon":
      return uncommon;
    case "legendary":
      return legendary;
    case "ultra-rare":
      return ultraRare;
    default:
      return common;
  }
};
