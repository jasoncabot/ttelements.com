import { SparklesIcon } from "@heroicons/react/24/outline";
import React from "react";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-amber-500">
      <div className="flex flex-col items-center justify-center rounded-lg bg-gray-900 p-12 shadow-lg">
        <SparklesIcon className="h-16 w-16" />
        <div className="mt-6 animate-pulse text-2xl font-semibold">
          {message ?? "getting ready..."}
        </div>
      </div>
    </div>
  );
};

export default Loading;
