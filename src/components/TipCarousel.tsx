import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";

const tips = [
  "Have you tried refreshing?",
  "Try going to https://ttelements.com",
  "Turned it off and on again?",
];

const TipCarousel = () => {
  const [showIndex, setShowIndex] = useState(0);
  const delay = 5000;

  useEffect(() => {
    const tipTimer = setTimeout(() => {
      setShowIndex((showIndex + 1) % tips.length);
    }, delay);

    return () => {
      clearTimeout(tipTimer);
    };
  }, [showIndex]);

  return (
    <div className="mt-6 flex h-full w-full items-center justify-center pt-20">
      {tips.map((content, index) => (
        <Transition
          key={index}
          show={index === showIndex}
          enter="transform transition duration-[400ms]"
          enterFrom="opacity-0 rotate-[-20deg] scale-50"
          enterTo="opacity-100 rotate-0 scale-100"
          leave="transform transition duration-[400ms]"
          leaveFrom="opacity-100 rotate-0 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="bg-opacity-70 flex flex-shrink-0 justify-center">
            <div className="rounded-md bg-gray-900 p-4 shadow-lg">
              <p className="text-white">{content}</p>
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
};

export default TipCarousel;
