import { Disclosure, Transition } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const GameRulePanel: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            as="div"
            className="mb-4 flex h-6 cursor-pointer flex-row items-center"
          >
            <h2 className="flex-grow text-2xl font-bold tracking-tight">
              {title}
            </h2>
            <ChevronRightIcon className="h-6 transition duration-200 ease-in-out ui-open:rotate-90 ui-open:transform" />
          </Disclosure.Button>
          <Disclosure.Panel static>
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
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default GameRulePanel;
