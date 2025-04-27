import {
  CheckCircleIcon,
  ClipboardIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ShareIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";

const WaitingForOpponentView: React.FC<{
  gameId: string;
}> = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = document.location.toString();
    }
  }, []);

  const handleCopy = async () => {
    const field = inputRef.current;
    if (!field) return;
    field.select();
    field.setSelectionRange(0, 99999);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(field.value);
      } else {
        document.execCommand("copy");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Failed to copy text: ", e);
    }
  };

  const handleShare = async () => {
    const url = document.location.toString();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my game!",
          text: "Play a game with me!",
          url,
        });
      } catch (e) {
        console.error("Failed to share: ", e);
      }
    } else {
      // fallback: copy to clipboard
      handleCopy();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-4 md:justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 bg-gradient-to-b from-gray-900 to-gray-800 p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <UserGroupIcon
            className="mb-4 h-12 w-12 text-amber-500"
            aria-hidden="true"
          />
          <h1 className="mb-2 text-center text-3xl font-extrabold text-amber-500">
            Invite a Friend to Play!
          </h1>
          <p className="text-md mb-6 text-center text-gray-300">
            Share this link with your friend to let them join your game. When
            they open the link, the game will begin!
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              readOnly
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 pr-12 text-center text-sm font-medium text-gray-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              aria-label="Game invite link"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 text-amber-500 hover:bg-amber-500/10 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              onClick={handleCopy}
              aria-label="Copy link"
            >
              {copied ? (
                <CheckCircleIcon
                  className="h-6 w-6 text-green-500"
                  aria-hidden="true"
                />
              ) : (
                <ClipboardIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          <button
            type="button"
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-bold text-white shadow hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            onClick={handleShare}
          >
            <ShareIcon className="h-5 w-5" aria-hidden="true" />
            Share
          </button>
        </div>
        <div className="mt-6 text-center text-xs text-gray-300">
          <span className="animate-pulse">
            Waiting for your opponent to join...
          </span>
        </div>
      </div>
    </div>
  );
};

export default WaitingForOpponentView;
