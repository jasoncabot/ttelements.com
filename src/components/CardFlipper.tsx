import React, { ReactNode, useEffect, useRef, useState } from "react";
import { classNames } from ".";

interface CardFlipperProps {
  front: ReactNode;
  back: ReactNode;
  duration?: string;
  initiallyFlipped?: boolean;
}

export const CardFlipper: React.FC<CardFlipperProps> = ({
  front,
  back,
  duration = "0.8s",
  initiallyFlipped = true,
}) => {
  const [showBack, setShowBack] = useState(initiallyFlipped);
  const [isInteracting, setIsInteracting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Only allow flipping from back to face
  const handleFlip = () => {
    if (showBack) setShowBack(false);
  };

  // Only allow 3D bending when showing face
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!showBack && pointerId.current === null) {
      pointerId.current = e.pointerId;
      setIsInteracting(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting || pointerId.current !== e.pointerId || !cardRef.current)
      return;
    // 3D tilt effect only when showing face
    if (!showBack) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const relativeX = (e.clientX - centerX) / (rect.width / 2);
      const relativeY = (e.clientY - centerY) / (rect.height / 2);
      setRotation({
        y: relativeX * 15,
        x: -relativeY * 15,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) {
      // If not interacting, treat as tap to flip (when showing back)
      if (showBack) handleFlip();
      return;
    }
    setIsInteracting(false);
    setRotation({ x: 0, y: 0 });
    pointerId.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerLeave = () => {
    if (!isInteracting) return;
    setIsInteracting(false);
    setRotation({ x: 0, y: 0 });
    pointerId.current = null;
  };

  // Keyboard accessibility: only flip from back to face
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && showBack) {
      e.preventDefault();
      handleFlip();
    }
  };

  useEffect(() => {
    return () => {
      pointerId.current = null;
    };
  }, []);

  const getCardStyle = () => {
    // Only allow 3D bending when showing face
    const flipTransform = showBack ? "rotateY(180deg)" : "";
    const dragTransform = !showBack
      ? `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`
      : flipTransform;
    return {
      transition: isInteracting
        ? "transform 0.1s cubic-bezier(0.4,0.2,0.2,1)"
        : `transform ${duration} cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
      transform: isInteracting ? dragTransform : flipTransform,
      transformStyle: "preserve-3d" as const,
      cursor: isInteracting ? "grabbing" : "pointer",
      touchAction: "pan-y", // Prevent scrolling during interaction
      userSelect: "none", // Prevent long-press selection
    } as React.CSSProperties;
  };

  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: "1200px" }}
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-pressed={!showBack}
      aria-label="Flip card"
      onKeyDown={handleKeyDown}
      onClick={showBack ? handleFlip : undefined}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={classNames(
          { flipped: showBack, dragging: isInteracting },
          "h-full w-full",
        )}
        style={getCardStyle()}
      >
        <div className="absolute h-full w-full backface-hidden">{front}</div>
        <div
          className="absolute h-full w-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};
