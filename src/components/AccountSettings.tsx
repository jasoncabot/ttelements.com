import { LockClosedIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router";

const AccountSettings: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Account Settings
        </h1>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <UserCircleIcon className="mx-auto h-12 w-12 text-gray-300 sm:mx-0 sm:mr-3 sm:mb-0" />
              <h3 className="mt-4 text-lg font-medium text-white sm:text-xl">
                Profile Information
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Manage your profile information
              </p>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:flex-shrink-0 sm:items-center">
              <Link
                to="/profile"
                className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 md:mt-8">
          <div className="rounded-lg bg-gray-800 px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div className="text-center sm:text-left">
                <LockClosedIcon className="mx-auto h-12 w-12 text-gray-300 sm:mx-0 sm:mr-3 sm:mb-0" />
                <h3 className="mt-4 text-lg font-medium text-white sm:text-xl">
                  Security
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Manage your account security settings
                </p>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:flex-shrink-0 sm:items-center">
                <Link
                  to="/settings/security"
                  className="rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
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
