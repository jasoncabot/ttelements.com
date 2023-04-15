import { SparklesIcon } from "@heroicons/react/24/outline";
import React from "react";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className="mt-16 flex animate-pulse flex-col items-center justify-center">
      <SparklesIcon className="h-12 w-12 text-white" />
      <div className="mt-4 text-2xl font-bold text-white">
        {message ?? "getting ready..."}
      </div>
    </div>
  );
};

export default Loading;
