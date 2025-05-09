import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  CreditCardIcon,
  StarIcon as EmptyStarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { SyntheticEvent, useEffect, useState } from "react";
import { useAuth } from "../providers/hooks";
import { AuthStatus } from "../services/AuthService";
import {
  PurchaseRequest,
  PurchaseResponse,
  UserDetailsResponse,
  ViewableCardResponse,
} from "../shared";
import { PackCosts, PurchaseKind } from "../shared/shop";
import BoosterPackViewer from "./BoosterPackViewer";
import CardRevealer from "./CardRevealer";
import { useMessageBanner } from "./MessageBanner";

const purchasable: {
  name: string;
  key: PurchaseKind;
  description: string[];
  price: number;
  starCount: number;
}[] = [
  {
    name: "Basic Pack",
    key: "basic",
    description: ["Some cards"],
    price: PackCosts["basic"],
    starCount: 1,
  },
  {
    name: "Premium Pack",
    key: "premium",
    description: ["Some better cards"],
    price: PackCosts["premium"],
    starCount: 2,
  },
  {
    name: "Ultimate Pack",
    key: "ultimate",
    description: ["The best cards"],
    price: PackCosts["ultimate"],
    starCount: 3,
  },
];

type ShopContentsProps = {
  points: number;
};

const ShopContents: React.FC<ShopContentsProps> = ({ points }) => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();

  const [purchased, setPurchased] = useState<ViewableCardResponse[]>([]);
  const [selectedPackKey, setSelectedPackKey] = useState<PurchaseKind | null>(
    null,
  );

  // Renamed original handler to initiate the viewing process
  const handleViewPack = (event: SyntheticEvent, pack: PurchaseKind) => {
    event.preventDefault();
    // Check if user has enough points (optional, but good UX)
    const packInfo = purchasable.find((p) => p.key === pack);
    if (packInfo && points < packInfo.price) {
      showMessage("Not enough points to purchase this pack.");
      return;
    }

    setSelectedPackKey(pack);
    setPurchased([]); // Clear previous results when opening a new pack
  };

  // This function will be called by BoosterPackViewer when the pack is "opened"
  const confirmPurchase = async () => {
    if (!selectedPackKey) return; // Should not happen if logic is correct

    try {
      const result = await fetchData<PurchaseResponse>(
        "post",
        "/purchase",
        {
          type: "booster",
          kind: selectedPackKey,
        } as PurchaseRequest,
        AuthStatus.REQUIRED,
      );

      setPurchased(result.entries.map((c) => c.card));
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Unknown error occurred during purchase");
      }
    } finally {
      setSelectedPackKey(null);
    }
  };

  const handleCloseViewer = () => {
    setSelectedPackKey(null);
    // If the purchase wasn't confirmed, don't show cards
    if (purchased.length === 0) {
      setPurchased([]);
    }
  };
  return (
    <div className="flex w-full flex-col">
      <Dialog
        open={!!selectedPackKey}
        onClose={handleCloseViewer}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900/95 shadow-2xl">
            <BoosterPackViewer
              packKey={selectedPackKey || "basic"}
              onClose={handleCloseViewer}
              onOpenComplete={confirmPurchase}
            ></BoosterPackViewer>
          </DialogPanel>
        </div>
      </Dialog>

      {purchased.length > 0 && (
        <div className="flex flex-col items-center justify-start md:justify-center">
          <h2 className="text-center text-xl font-semibold text-gray-300">
            You received {purchased.length}{" "}
            {purchased.length === 1 ? "card" : "cards"}
          </h2>
          <div className="my-4 w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900/95 bg-gradient-to-b from-gray-800 to-gray-900">
            <CardRevealer cards={purchased} />
          </div>
        </div>
      )}

      <div className="flex w-full flex-col items-center justify-start gap-4 md:flex-row md:justify-center md:gap-6">
        {purchasable.map((pack) => (
          <div
            key={pack.name}
            className="flex min-h-[320px] w-full flex-col justify-between rounded-xl border border-gray-800 bg-gray-900/90 p-6 shadow-lg"
          >
            {/* ... pack details ... */}
            <div className="mb-2 flex flex-col items-center justify-between">
              <div className="text-xl font-bold tracking-tight text-gray-100">
                {pack.name}
              </div>
              <div className="flex items-center">
                <CreditCardIcon className="mr-1 h-5 w-5 text-amber-500" />
                <div className="text-s font-semibold text-amber-500">
                  {pack.price} {pack.price == 1 ? "point" : "points"}
                </div>
              </div>
              <div className="mt-3 flex items-center">
                {/* Display stars based on pack.starCount */}
                {Array.from({ length: pack.starCount }, (_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
                {Array.from({ length: 3 - pack.starCount }, (_, i) => (
                  <EmptyStarIcon key={i} className="h-5 w-5 text-gray-600" />
                ))}
              </div>
            </div>

            <div className="mt-1">
              <ul className="divide-y divide-gray-800">
                {pack.description.map((desc, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-2 text-sm text-gray-400"
                  >
                    <div className="flex items-center">
                      <div className="ml-2">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-1">
              <button
                className="w-full cursor-pointer rounded-lg bg-amber-500 px-4 py-2 font-bold text-white transition-colors duration-150 hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                type="button"
                onClick={(e) => handleViewPack(e, pack.key)}
                disabled={points < pack.price}
              >
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Shop = () => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();
  const [points, setPoints] = useState<number>(0);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await fetchData<UserDetailsResponse>(
          "get",
          "/user/details",
          null,
          AuthStatus.REQUIRED,
        );
        setPoints(data.points);
      } catch (e: unknown) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage("Unknown error occurred while fetching user details");
        }
      }
    };
    fetchUserDetails();
  }, [fetchData, showMessage]);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">Shop</h1>
        <h2>
          You have {points} {points == 1 ? "point" : "points"}
        </h2>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
          <ShopContents points={points} />
        </div>
      </div>
    </div>
  );
};

export default Shop;
