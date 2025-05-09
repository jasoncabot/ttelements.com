import React from "react";
import {
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  TrashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const SecuritySettings: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Security
        </h1>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="rounded-lg bg-gray-800 px-4 sm:px-6 lg:px-8">
          {/* Change Password Section */}
          <div className="flex items-center justify-between border-b border-gray-700 py-4">
            <div className="flex items-center space-x-4">
              <KeyIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Password
                </h2>
                <p className="text-sm text-gray-400">Change your password.</p>
              </div>
            </div>
            <button className="flex cursor-pointer items-center rounded bg-gray-700 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-600">
              Change <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* Change Email Section */}
          <div className="flex items-center justify-between border-b border-gray-700 py-4">
            <div className="flex items-center space-x-4">
              <EnvelopeIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Email Address
                </h2>
                <p className="text-sm text-gray-400">
                  Change the email address associated with your account.
                </p>
              </div>
            </div>
            <button className="flex cursor-pointer items-center rounded bg-gray-700 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-600">
              Change <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* Two-Factor Authentication Section */}
          <div className="flex items-center justify-between border-b border-gray-700 py-4">
            <div className="flex items-center space-x-4">
              <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Two-Factor Authentication (2FA)
                </h2>
                <p className="text-sm text-gray-400">
                  Add an extra layer of security to your account.
                </p>
                {/* Placeholder status - replace with actual state */}
                <span className="mt-1 inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                  Disabled
                </span>
                {/* Or use bg-green-600 for Enabled */}
              </div>
            </div>
            <button className="flex cursor-pointer items-center rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400">
              Set Up 2FA <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* Account Activity Section */}
          <div className="flex items-center justify-between border-b border-gray-700 py-4">
            <div className="flex items-center space-x-4">
              <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  Account Activity
                </h2>
                <p className="text-sm text-gray-400">
                  Review recent login activity and active sessions.
                </p>
              </div>
            </div>
            <button className="flex cursor-pointer items-center rounded bg-gray-700 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-600">
              View Activity <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* Delete Account Section */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <TrashIcon className="h-6 w-6 text-red-500" />
              <div>
                <h2 className="text-lg font-semibold text-red-500">
                  Delete Account
                </h2>
                <p className="text-sm text-gray-400">
                  Permanently delete your account and all associated data.
                </p>
              </div>
            </div>
            <button className="flex cursor-pointer items-center rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
              Delete Account <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
