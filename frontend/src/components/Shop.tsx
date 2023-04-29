import { CreditCardIcon } from "@heroicons/react/24/outline";
import {
  PurchaseRequest,
  PurchaseResponse,
  UserDetailsResponse,
  ViewableCardResponse,
} from "@ttelements/shared";
import { SyntheticEvent, useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { AuthStatus } from "../services/AuthService";
import { useMessageBanner } from "./MessageBanner";
import CardRevealer from "./CardRevealer";

type PackKey = "basic" | "premium" | "ultimate";

const purchasable: {
  name: string;
  key: PackKey;
  price: number;
}[] = [
  {
    name: "Basic Pack",
    key: "basic",
    price: 100,
  },
  {
    name: "Premium Pack",
    key: "premium",
    price: 500,
  },
  {
    name: "Ultimate Pack",
    key: "ultimate",
    price: 1000,
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
          AuthStatus.REQUIRED
        );
        setPoints(data.points);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    fetchUserDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [purchased, setPurchased] = useState<ViewableCardResponse[]>([]);
  const handlePurchase = async (event: SyntheticEvent, pack: PackKey) => {
    event.preventDefault();
    try {
      const result = await fetchData<PurchaseResponse>(
        "post",
        "/purchase",
        {
          type: "pack",
          kind: pack,
        } as PurchaseRequest,
        AuthStatus.REQUIRED
      );

      setPurchased(result.entries.map((c) => c.card));
    } catch (e: any) {
      showMessage(e.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Buy Cards</h1>
      <h2 className="text-1xl font-light tracking-tight">
        You have {points} points
      </h2>

      {purchased.length > 0 && (
        <div className="mt-4 flex flex-col space-y-4 rounded bg-gray-900 p-8 shadow">
          <CardRevealer cards={purchased} />
        </div>
      )}

      <div className="flex flex-grow flex-col pt-8">
        <div className="flex w-full flex-col space-y-8 md:flex-row md:space-x-16 md:space-y-0">
          {purchasable.map((pack) => (
            <div
              key={pack.name}
              className="w-full rounded-lg bg-gray-900 p-4 shadow-md md:w-1/3"
            >
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
                  <li className="py-4">5 x ??</li>
                  <li className="py-4">5 x ??</li>
                  <li className="py-4">1 x ??</li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  className="w-full rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  type="button"
                  onClick={(e) => handlePurchase(e, pack.key)}
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
