import { LockClosedIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router";

interface Props {}

const AccountSettings: React.FC<Props> = () => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Card Collection</h1>
      <div className="mt-8 rounded bg-gray-900 p-8">
        <div className="mt-5 md:mt-8">
          <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div className="text-center sm:text-left">
                <UserCircleIcon className="mx-auto h-12 w-12 text-gray-300 sm:mx-0 sm:mb-0 sm:mr-3" />
                <h3 className="mt-4 text-lg font-medium text-white sm:text-xl">
                  Profile Information
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Manage your profile information
                </p>
              </div>
              <div className="mt-5">
                <Link
                  to="/profile"
                  className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 md:mt-8">
          <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div className="text-center sm:text-left">
                <LockClosedIcon className="mx-auto h-12 w-12 text-gray-300 sm:mx-0 sm:mb-0 sm:mr-3" />
                <h3 className="mt-4 text-lg font-medium text-white sm:text-xl">
                  Security
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Manage your account security settings
                </p>
              </div>
              <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
                <Link
                  to="/settings/security"
                  className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  Edit Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
