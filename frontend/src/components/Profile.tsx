import { UserCircleIcon } from "@heroicons/react/24/solid";
import { UserDetailsResponse } from "@ttelements/shared";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { AuthStatus } from "../services/AuthService";
import { useMessageBanner } from "./MessageBanner";

const Profile: React.FC<{}> = () => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();

  const [points, setPoints] = useState<number>(0);
  const [name, setName] = useState<string>("");
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
        setName(data.name);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    fetchUserDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <div className="mt-8 flex flex-col justify-between rounded-lg bg-gray-900 p-8 shadow-md">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <div className="h-12 w-12 flex-shrink-0">
              <UserCircleIcon className="h-12 w-12 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold leading-6 text-white">{name}</h2>
              <p className="text-sm font-medium text-white">{points} points</p>
            </div>
          </div>

          <p className="text-white-400 mt-4 flex-grow">
            You can reset all the cards you own and get a brand new starter pack
          </p>
          <div className="mt-4">
            <Link
              to="/starter"
              className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            >
              Reset
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
