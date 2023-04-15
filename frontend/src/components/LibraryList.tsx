import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { CardEdition } from "@ttelements/shared";
import { useState } from "react";
import { classNames } from ".";
import CardGrid from "./CardGrid";
import { CardLevel, LibraryCardMapping } from "./Library";

interface LibraryListProps {
  data: LibraryCardMapping;
}

const LibraryList: React.FC<LibraryListProps> = ({ data }) => {
  const [selectedEdition, setSelectedEdition] = useState<CardEdition>("ff8");
  const [selectedLevel, setSelectedLevel] = useState<CardLevel>(1);

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-600 py-3">
        <h1 className="text-xl font-medium text-gray-300">
          Viewing {selectedEdition}
        </h1>
        <Menu
          as="div"
          className="relative inline-block space-x-1 text-left text-gray-400"
        >
          {({ open }) => (
            <>
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                  <span>Select an edition</span>
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items className="absolute z-10 mt-2 w-full rounded-md border-none bg-gray-900 bg-white text-gray-300 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {Array.from(data.keys()).map((edition) => (
                    <div key={edition} className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedEdition(edition)}
                            className={classNames(
                              { "bg-gray-100 text-gray-900": active },
                              { "text-gray-700": !active },
                              "block w-full px-4 py-2 text-left text-sm"
                            )}
                          >
                            {edition}
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  ))}
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>

      <div className="sm:hidden">
        <label htmlFor="tabs">Card level</label>
        <select
          id="tabs"
          onChange={(e) =>
            setSelectedLevel(parseInt(e.target.value, 10) as CardLevel)
          }
          className="focus:shadow-outline flex-grow appearance-none rounded bg-transparent px-4 py-2 pr-8 leading-tight shadow focus:outline-none"
        >
          {Array.from(data.get(selectedEdition)?.keys() || []).map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
      </div>
      <ul className="hidden divide-x divide-gray-200 rounded-lg text-center text-sm font-medium text-gray-500 shadow dark:divide-gray-700 dark:text-gray-400 sm:flex">
        {Array.from(data.get(selectedEdition)?.keys() || []).map((level) => (
          <li key={level} className="w-full">
            <button
              className={classNames(
                { "active bg-gray-300": selectedLevel === level },
                { "rounded-l-lg ": level === 1 },
                { "rounded-r-lg ": level === 10 },
                "inline-block w-full bg-gray-100 p-4 text-gray-900"
              )}
              onClick={(e) => {
                e.preventDefault();
                setSelectedLevel(level);
              }}
              aria-current="page"
            >
              Level {level}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <CardGrid cards={data.get(selectedEdition)?.get(selectedLevel) || []} />
      </div>
    </>
  );
};

export default LibraryList;
