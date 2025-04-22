import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { classNames } from ".";
import { CardEdition } from "../shared";
import { nameForLevel } from "../shared/cards";
import CardGrid from "./CardGrid";
import { CardLevel, LibraryCardMapping } from "./Library";

interface LibraryListProps {
  data: LibraryCardMapping;
}

const LibraryList: React.FC<LibraryListProps> = ({ data }) => {
  const [selectedEdition, setSelectedEdition] = useState<CardEdition>("ff8");
  const [selectedLevel, setSelectedLevel] = useState<CardLevel>(1);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header and Edition Selector */}
      <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-700 pb-3 sm:flex-row">
        <h1 className="text-lg font-semibold text-gray-200 sm:text-xl">
          My Library:{" "}
          <span className="font-bold text-white">
            {selectedEdition.toUpperCase()}
          </span>
        </h1>
        <Menu
          as="div"
          className="relative inline-block w-full text-left sm:w-auto"
        >
          <div>
            <MenuButton className="focus-visible:ring-opacity-75 inline-flex w-full cursor-pointer justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span>Change Edition</span>
              <ChevronDownIcon
                className="-mr-1 ml-2 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </MenuButton>
          </div>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black focus:outline-none">
              <div className="py-1">
                {Array.from(data.keys()).map((edition) => (
                  <MenuItem key={edition}>
                    {({ focus }) => (
                      <button
                        onClick={() => setSelectedEdition(edition)}
                        className={classNames(
                          focus ? "bg-gray-700 text-white" : "text-gray-300",
                          "block w-full cursor-pointer px-4 py-2 text-left text-sm",
                        )}
                      >
                        {edition.toUpperCase()}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      {/* Level Selector - Mobile */}
      <div className="lg:hidden">
        <Menu as="div" className="relative inline-block w-full text-left">
          <div>
            <MenuButton className="inline-flex w-full cursor-pointer justify-between rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none">
              <span>{nameForLevel(selectedLevel, selectedEdition)}</span>
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </MenuButton>
          </div>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="ring-opacity-5 absolute left-0 z-10 mt-2 max-h-60 w-full origin-top-right overflow-y-auto rounded-md bg-gray-800 shadow-lg ring-1 ring-black focus:outline-none">
              <div className="py-1">
                {Array.from(data.get(selectedEdition)?.keys() || []).map(
                  (level) => (
                    <MenuItem key={level}>
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedLevel(level)}
                          className={classNames(
                            active ? "bg-gray-700 text-white" : "text-gray-300",
                            "block w-full cursor-pointer px-4 py-2 text-left text-sm",
                          )}
                        >
                          {nameForLevel(level, selectedEdition)}
                        </button>
                      )}
                    </MenuItem>
                  ),
                )}
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      {/* Level Selector - Desktop */}
      <div className="hidden lg:block">
        <nav
          className="flex space-x-1 rounded-lg bg-gray-700 p-1"
          aria-label="Tabs"
        >
          {Array.from(data.get(selectedEdition)?.keys() || []).map((level) => (
            <button
              key={level}
              onClick={(e) => {
                e.preventDefault();
                setSelectedLevel(level);
              }}
              className={classNames(
                selectedLevel === level
                  ? "bg-gray-800 text-white shadow" // Active tab
                  : "text-gray-300 hover:bg-gray-600 hover:text-white", // Inactive tab
                "flex-1 cursor-pointer rounded-md px-3 py-2 text-center text-sm font-medium",
              )}
              aria-current={selectedLevel === level ? "page" : undefined}
            >
              {nameForLevel(level, selectedEdition)}
            </button>
          ))}
        </nav>
      </div>

      {/* Card Grid Display */}
      <div className="mt-4 md:mt-6">
        <CardGrid cards={data.get(selectedEdition)?.get(selectedLevel) || []} />
      </div>
    </div>
  );
};

export default LibraryList;
