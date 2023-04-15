import React, { ReactNode, useState } from "react";
import { classNames } from ".";

interface CardFlipperProps {
  front: ReactNode;
  back: ReactNode;
  duration?: string;
}

export const CardFlipper: React.FC<CardFlipperProps> = ({
  front,
  back,
  duration,
}) => {
  const [showBack, setShowBack] = useState(false);

  const handleClick = () => {
    setShowBack(!showBack);
  };

  return (
    <div
      className="relative h-full w-full"
      style={{
        perspective: "1200px",
      }}
    >
      <div
        onClick={handleClick}
        className={classNames({ flipped: showBack }, "h-full w-full")}
        style={{
          transition: `transform ${
            duration ?? "1s"
          } cubic-bezier( 0.95, 0.05, 0.795, 0.035 )`,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute h-full w-full backface-hidden">{front}</div>
        <div className="absolute h-full w-full backface-hidden flipped">
          {back}
        </div>
      </div>
    </div>
  );
};
