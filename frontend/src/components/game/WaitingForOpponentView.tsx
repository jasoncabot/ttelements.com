import React, { useEffect, useRef } from "react";

const WaitingForOpponentView: React.FC<{
  gameId: string;
}> = ({ gameId }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = document.location.toString();
    }
  });

  return (
    <div className="flex flex-col items-center">
      <div className="mt-16 rounded bg-gray-900 p-8 shadow-md md:w-1/2">
        <h1 className="text-2xl font-bold tracking-tight">
          Waiting for opponent
        </h1>
        <h2 className="text-l text-gray-400 ">
          Share this link with your opponent
        </h2>
        <div className="mt-8">
          <input
            ref={inputRef}
            type="text"
            autoFocus={true}
            className="title-font w-full rounded p-4 text-center text-sm font-medium text-gray-900"
          />
          <button
            type="button"
            className="mt-4 w-full rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            onClick={async (e) => {
              const field = inputRef.current;
              if (!field) return;

              field.select();
              field.setSelectionRange(0, 99999);

              // check if we can use the clipboard
              if (!navigator.clipboard) {
                return;
              }
              await navigator.clipboard.writeText(field.value);
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForOpponentView;
