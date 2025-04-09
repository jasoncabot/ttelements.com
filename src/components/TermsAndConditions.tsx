import React from "react";

interface TermsAndConditionsProps {}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = () => {
  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Terms &amp; Conditions
      </h1>
      <div className="mt-8 rounded bg-gray-900 p-8">
        <p className="text-white-400 flex-grow">
          Just be nice
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
