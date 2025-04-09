import { CreditCardIcon, StarIcon } from "@heroicons/react/24/outline";
import { SyntheticEvent, useEffect, useState } from "react";
import { useAuth } from "../providers/hooks";
import { AuthStatus } from "../services/AuthService";
import {
  PurchaseRequest,
  PurchaseResponse,
  UserDetailsResponse,
  ViewableCardResponse,
} from "../shared";
import BoosterPackViewer from "./BoosterPackViewer";
import CardRevealer from "./CardRevealer";
import { useMessageBanner } from "./MessageBanner";
import { PurchaseKind } from "../shared/shop";
import { Dialog, DialogBackdrop } from "@headlessui/react";

const purchasable: {
  name: string;
  key: PurchaseKind;
  description: string[];
  price: number;
}[] = [
  {
    name: "Basic Pack",
    key: "basic",
    description: ["5 x Common", "5 x Uncommon", "1 x Rare"],
    price: 0, //100,
  },
  {
    name: "Premium Pack",
    key: "premium",
    description: ["5 x Rare", "5 x Epic", "1 x Legendary"],
    price: 0, //500,
  },
  {
    name: "Ultimate Pack",
    key: "ultimate",
    description: ["5 x Epic", "5 x Legendary", "1 x Mythic"],
    price: 0, //1000,
  },
];

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

  const [purchased, setPurchased] = useState<ViewableCardResponse[]>([]);
  // State for the booster pack modal
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
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Buy Cards</h1>
      <h2 className="text-1xl font-light tracking-tight">
        You have {points} points
      </h2>

      <Dialog
        open={!!selectedPackKey}
        onClose={handleCloseViewer}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <BoosterPackViewer
            packKey={selectedPackKey || "basic"}
            onClose={handleCloseViewer}
            onOpenComplete={confirmPurchase}
          >
            {" "}
          </BoosterPackViewer>
        </div>
      </Dialog>

      {purchased.length > 0 && (
        <div className="mt-2 flex flex-col items-center justify-start md:justify-center">
          <div className="w-full rounded-lg border border-gray-700 bg-gray-900 bg-gradient-to-b from-gray-800 to-gray-900 p-4 shadow-xl">
            <CardRevealer cards={purchased} />
          </div>
        </div>
      )}

      <div className="flex flex-grow flex-col px-4 pt-8 md:px-0">
        <div className="flex w-full flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-16">
          {purchasable.map((pack) => (
            <div
              key={pack.name}
              className="w-full rounded-lg bg-gray-900 p-4 shadow-md md:w-1/3"
            >
              {/* ... pack details ... */}
              <div className="flex justify-between">
                <div className="text-xl font-bold tracking-tight text-gray-200">
                  {pack.name}
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="mr-1 h-5 w-5 text-gray-400" />
                  <div className="text-sm font-medium text-gray-400">
                    {pack.price} points
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <ul className="divide-y divide-gray-700">
                  {pack.description.map((desc, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between py-2 text-sm text-gray-400"
                    >
                      <div className="flex items-center">
                        <div className="ml-2">{desc}</div>
                      </div>
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <button
                  className="w-full cursor-pointer rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                  type="button"
                  // Update onClick to call the new handler
                  onClick={(e) => handleViewPack(e, pack.key)}
                  // Disable button if pack viewer is open or not enough points
                  disabled={points < pack.price}
                >
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
