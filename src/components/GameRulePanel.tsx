import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from "@headlessui/react";
import React from "react";

import { ChevronRightIcon } from "@heroicons/react/24/solid";

const GameRulePanel: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <DisclosureButton
            as="div"
            className="group mb-4 flex h-6 cursor-pointer flex-row items-center"
          >
            <h2 className="flex-grow text-2xl font-bold tracking-tight">
              {title}
            </h2>
            <ChevronRightIcon className="size-5 fill-white/60 transition-transform duration-200 group-data-[hover]:fill-white/50 group-data-[open]:rotate-90" />
          </DisclosureButton>
          <DisclosurePanel static>
            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              {children}
            </Transition>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default GameRulePanel;
