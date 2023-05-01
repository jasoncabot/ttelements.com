import React from "react";

const SecuritySettings: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Security</h1>
      <div className="mt-8 space-y-8 rounded bg-gray-900 p-8">
        <p className="text-gray-100">Add some options here like</p>
        <ul>
            <li className="text-gray-100">Change password</li>
            <li className="text-gray-100">Change email</li>
            <li className="text-gray-100">Add 2fa</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;
